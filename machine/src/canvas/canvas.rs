use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use snafu::ensure;
use crate::canvas::blocks::BlockData::{Machine, Memory};
use crate::canvas::error::CanvasError::{BlockNotFound, MachineError};
use crate::{Action, Event, Message, Sequencer};
use crate::audio::wavetable::Wavetable;
use crate::canvas::{BlockIdInUseSnafu};
use crate::canvas::CanvasError::{CannotFindWire};
use super::blocks::{Block, BlockData};
use super::error::{BlockNotFoundSnafu, CannotWireToItselfSnafu, CanvasError, MachineNotFoundSnafu};
use super::wire::{Port, Wire};
use crate::audio::waveform::Waveform;

pub type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
    pub seq: Sequencer,

    pub block_id_counter: u16,
    pub wire_id_counter: u16,

    /// How many cycles should the machine run per tick? i.e. their clock speed.
    pub machine_cycle_per_tick: u16,

    /// How many messages can the inbox hold before it starts dropping messages?
    pub inbox_limit: usize,

    /// Used for pre-computing waveforms for performance.
    #[serde(skip)]
    pub wavetable: Wavetable,
}

impl Canvas {
    pub fn new() -> Canvas {
        Canvas {
            blocks: vec![],
            wires: vec![],

            seq: Sequencer::new(),
            wavetable: Wavetable::new(),

            block_id_counter: 0,
            wire_id_counter: 0,

            inbox_limit: 100,
            machine_cycle_per_tick: 1,
        }
    }

    pub fn block_id(&mut self) -> u16 {
        let id = self.block_id_counter;
        self.block_id_counter += 1;
        id
    }

    /// Set the machine's clock speed, in cycles per tick.
    pub fn set_machine_clock_speed(&mut self, cycle_per_tick: u16) {
        self.machine_cycle_per_tick = cycle_per_tick;
    }

    pub fn remove_block(&mut self, id: u16) -> Errorable {
        let block_idx = self.blocks.iter().position(|b| b.id == id).ok_or(BlockNotFound { id })?;

        // Teardown logic
        match self.blocks[block_idx].data {
            // Remove the machine from the sequencer.
            Machine { machine_id } => self.seq.remove(machine_id),

            _ => {}
        }

        // Remove blocks from the canvas.
        self.blocks.remove(block_idx);

        // Remove all wires connected to the block.
        self.wires.retain(|w| w.source.block != id && w.target.block != id);

        Ok(())
    }

    pub fn add_machine(&mut self) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_machine_with_id(id)?;

        Ok(id)
    }

    pub fn add_machine_with_id(&mut self, id: u16) -> Errorable {
        self.seq.add(id);
        self.add_block_with_id(id, Machine { machine_id: id })?;

        Ok(())
    }

    pub fn add_block(&mut self, data: BlockData) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_block_with_id(id, data)?;

        Ok(id)
    }

    pub fn add_block_with_id(&mut self, id: u16, data: BlockData) -> Errorable {
        // Prevent duplicate block ids from being added.
        ensure!(!self.blocks.iter().any(|b| b.id == id), BlockIdInUseSnafu {id});

        // Validate block data before adding them.
        match data {
            Machine { machine_id } => {
                ensure!(self.seq.get(machine_id).is_some(), MachineNotFoundSnafu { id: machine_id });
            }
            _ => {}
        }

        self.blocks.push(Block::new(id, data));
        Ok(())
    }

    pub fn connect(&mut self, source: Port, target: Port) -> Result<u16, CanvasError> {
        ensure!(source != target, CannotWireToItselfSnafu { port: source });

        // Do not add duplicate wires.
        if let Some(w) = self.wires.iter().find(|w| w.source == source && w.target == target) {
            return Ok(w.id);
        }

        // Source block must exist.
        ensure!(
            self.blocks.iter().any(|b| b.id == source.block),
            BlockNotFoundSnafu { id: source.block },
        );

        // Target block must exist.
        ensure!(
            self.blocks.iter().any(|b| b.id == target.block),
            BlockNotFoundSnafu { id: target.block },
        );

        // Increment the wire id
        let id = self.wire_id_counter;
        self.wire_id_counter += 1;

        self.wires.push(Wire { id, source, target });
        Ok(id)
    }

    pub fn disconnect(&mut self, src: Port, dst: Port) -> Errorable {
        let Some(wire_index) = self.wires.iter().position(|w| w.source == src && w.target == dst) else {
            return Err(CannotFindWire { src, dst });
        };

        self.wires.remove(wire_index);
        Ok(())
    }

    pub fn get_block(&self, id: u16) -> Result<&Block, CanvasError> {
        self.blocks.iter().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn mut_block(&mut self, id: u16) -> Result<&mut Block, CanvasError> {
        self.blocks.iter_mut().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn tick(&mut self, count: u16) -> Errorable {
        let ids: Vec<u16> = self.blocks.iter().map(|b| b.id).collect();

        for _ in 0..count {
            // Collect the messages, and route them to their destination blocks.
            self.route_messages()?;

            // Tick each block.
            for id in ids.clone() {
                self.tick_block(id)?
            }

            // Tick the machine sequencer.
            if !self.seq.is_halted() {
                self.seq.step(self.machine_cycle_per_tick)
                    .map_err(|cause| MachineError { cause: cause.clone() })?;
            }
        }

        Ok(())
    }

    pub fn get_connected_sinks(&self, id: u16) -> Vec<Wire> {
        self.wires.iter().filter(|w| w.source.block == id).cloned().collect()
    }

    pub fn send_data_to_sinks(&mut self, id: u16, body: Vec<u16>) -> Errorable {
        let wires = self.get_connected_sinks(id);

        for wire in wires {
            self.send_message_to_port(Message {
                sender: wire.source,
                action: Action::Data { body: body.clone() },
                recipient: None,
            })?;
        }

        Ok(())
    }

    pub fn generate_waveform(&mut self, waveform: Waveform, time: u16) -> u16 {
        self.wavetable.get(waveform, time)
    }

    // TODO: improve bi-directional connection resolution.
    pub fn resolve_port(&self, port: Port) -> Option<Vec<u16>> {
        Some(self.wires.iter().filter(|w| w.source == port || w.target == port).map(|w| w.target.block).collect())
    }

    /// Run every machine until all halts.
    pub fn run(&mut self) -> Errorable {
        self.seq.ready();

        for _ in 1..1000 {
            if self.seq.is_halted() { break; }
            self.tick(1)?;
        }

        self.tick(1)?;

        Ok(())
    }

    /// Collect messages from each outboxes to the respective inboxes.
    pub fn route_messages(&mut self) -> Errorable {
        // Collect the messages from the blocks and the machines.
        let mut messages = self.consume_messages();
        messages.extend(self.seq.consume_messages());

        // If the message has a recipient, send it directly to the machine.
        // Otherwise, identify connected blocks and send the message to them.
        for message in messages {
            match message.recipient {
                Some(_) => self.send_message_to_recipient(message)?,
                None => self.send_message_to_port(message)?,
            }
        }

        Ok(())
    }

    fn consume_messages(&mut self) -> Vec<Message> {
        self.blocks.iter_mut().flat_map(|block| block.outbox.drain(..)).collect()
    }

    pub fn load_program(&mut self, id: u16, source: &str) -> Errorable {
        self.seq.load(id, source).map_err(|cause| MachineError { cause })
    }

    pub fn update_block(&mut self, id: u16, data: BlockData) -> Errorable {
        self.mut_block(id)?.data = data;
        Ok(())
    }

    pub fn reset_blocks(&mut self) -> Errorable {
        // Collect the ids of the blocks that we can reset.
        // Machine block is handled separately, so we don't need to tick them.
        let ids: Vec<_> = self.blocks.iter().filter(|b| !b.data.is_machine()).map(|b| b.id).collect();

        for id in ids {
            // Do not reset if the block is not auto-reset.
            // This means the memory block is storing persistent data.
            if let Memory { auto_reset, .. } = self.get_block(id)?.data {
                if !auto_reset { continue; }
            }

            self.reset_block(id)?;
        }

        Ok(())
    }

    pub fn reset_block(&mut self, id: u16) -> Errorable {
        self.send_message_to_block(id, Action::Reset)?;
        self.tick_block(id)?;

        Ok(())
    }

    /// Disable the await watchdog if we know the message will eventually arrive.
    pub fn set_await_watchdog(&mut self, enabled: bool) {
        self.seq.await_watchdog = enabled;
    }

    /// Consume the side effect events in the frontend.
    pub fn consume_block_side_effects(&mut self) -> HashMap<u16, Vec<Event>> {
        let mut effects = HashMap::new();

        for block in &mut self.blocks {
            effects.insert(block.id, block.events.drain(..).collect());
        }

        effects
    }

    pub fn recompute_id_counters(&mut self) {
        self.wire_id_counter = self.wires.iter().map(|x| x.id).max().unwrap_or(0) + 1;
        self.block_id_counter = self.blocks.iter().map(|x| x.id).max().unwrap_or(0) + 1;
    }
}


