use snafu::ensure;
use crate::canvas::block::BlockData::{Clock, Machine, MidiIn, Osc, Pixel, Plot};
use crate::canvas::error::CanvasError::{BlockNotFound, DisconnectedPort, MachineError};
use crate::{Action, Message, Sequencer};
use crate::audio::waveform::generate_waveform;
use crate::canvas::{BlockIdInUseSnafu};
use crate::canvas::CanvasError::{CannotFindWire};
use crate::canvas::PixelMode::{Append, Command, Replace};
use crate::canvas::vec_helper::extend_and_remove_oldest;
use super::block::{Block, BlockData};
use super::error::{BlockNotFoundSnafu, CannotWireToItselfSnafu, CanvasError, MachineNotFoundSnafu};
use super::wire::{Port, port, Wire};

type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
    pub seq: Sequencer,

    block_id_counter: u16,
    wire_id_counter: u16,
}

impl Canvas {
    pub fn new() -> Canvas {
        Canvas {
            blocks: vec![],
            wires: vec![],
            seq: Sequencer::new(),

            block_id_counter: 0,
            wire_id_counter: 0,
        }
    }

    pub fn block_id(&mut self) -> u16 {
        let id = self.block_id_counter;
        self.block_id_counter += 1;
        id
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

    pub fn tick(&mut self) -> Errorable {
        let ids: Vec<u16> = self.blocks.iter().map(|b| b.id).collect();

        self.route_messages()?;

        for id in ids {
            self.tick_block(id)?
        }

        if !self.seq.is_halted() {
            self.seq.step().map_err(|cause| MachineError { cause })?;
        }

        Ok(())
    }

    pub fn tick_block(&mut self, id: u16) -> Errorable {
        let block = self.mut_block(id)?;
        let messages = block.consume_messages();

        match &block.data {
            Pixel { .. } => self.tick_pixel_block(id, messages)?,
            Plot { .. } => self.tick_plotter_block(id, messages)?,
            Osc { .. } => self.tick_osc_block(id, messages)?,
            Clock { .. } => self.tick_clock_block(id, messages)?,
            MidiIn { .. } => self.tick_midi_in_block(id, messages)?,
            _ => {}
        }

        Ok(())
    }

    pub fn get_connected_sinks(&self, id: u16) -> Vec<Wire> {
        self.wires.iter().filter(|w| w.source.block == id).cloned().collect()
    }

    pub fn send_data_to_sinks(&mut self, id: u16, body: Vec<u16>) -> Errorable {
        let wires = self.get_connected_sinks(id);

        for wire in wires {
            self.send_message(Message { port: wire.source, action: Action::Data { body: body.clone() } })?;
        }

        Ok(())
    }

    pub fn tick_osc_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in &messages {
            match &message.action {
                Action::SetWaveform { waveform: wf } => {
                    let block = self.mut_block(id)?;
                    let Osc { waveform } = &mut block.data else { return Ok(()); };

                    *waveform = *wf;
                }
                Action::Data { body } => {
                    let block = self.get_block(id)?;
                    let Osc { waveform } = &block.data else { return Ok(()); };

                    // Generate the waveform values out of the given input values, between (0 - 255).
                    let values: Vec<u16> = body.iter().map(|v| generate_waveform(*waveform, *v)).collect();

                    // Send the waveform values to the connected blocks.
                    self.send_data_to_sinks(id, values)?;
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_clock_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.get_block(id)?;
        let Clock { time } = block.data else { return Ok(()); };

        self.send_data_to_sinks(id, vec![time])?;

        let block = self.mut_block(id)?;
        let Clock { time } = &mut block.data else { return Ok(()); };

        for message in &messages {
            match &message.action {
                Action::Reset => {
                    *time = 0;
                }

                _ => {}
            }
        }

        // increment the time, or wrap around to 0.
        *time = (*time).checked_add(1).unwrap_or(0);

        // wrap around at 255.
        if *time >= 255 {
            *time = 0;
        }

        Ok(())
    }

    pub fn tick_plotter_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;
        let Plot { values, size } = &mut block.data else { return Ok(()); };

        for message in messages {
            match message.action {
                Action::Data { body } => {
                    extend_and_remove_oldest(values, body, *size as usize);
                }

                Action::Reset => {
                    values.clear()
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_midi_in_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;
        let MidiIn { .. } = &mut block.data else { return Ok(()); };

        for message in messages {
            match message.action {
                Action::Midi { value, note, .. } => {
                    self.send_data_to_sinks(id, vec![note as u16, value as u16])?;
                }
                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_pixel_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;
        let Pixel { pixels, mode } = &mut block.data else { return Ok(()); };

        for message in messages {
            match message.action {
                // The "data" action is used to directly set the pixel data.
                Action::Data { body } => {
                    match mode {
                        Replace => {
                            pixels.clear();
                            pixels.extend(&body);
                        }
                        Append => {
                            for byte in body {
                                // Remove one pixel.
                                if byte == 0 {
                                    if !pixels.is_empty() {
                                        pixels.pop();
                                    }

                                    continue;
                                }

                                pixels.push(byte);
                            }
                        }
                        Command => {
                            // TODO: implement command consumer
                        }
                    }
                }

                Action::SetPixelMode { mode: m } => {
                    *mode = m;
                }

                Action::Reset => {
                    pixels.clear()
                }

                _ => {}
            }
        }

        Ok(())
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
            self.tick()?;
        }

        self.tick()?;

        Ok(())
    }

    fn route_messages(&mut self) -> Errorable {
        // Collect the messages from the blocks and the machines.
        let mut messages = self.consume_messages();
        messages.extend(self.seq.consume_messages());

        for message in messages {
            self.send_message(message)?;
        }

        Ok(())
    }

    fn consume_messages(&mut self) -> Vec<Message> {
        self.blocks.iter_mut().flat_map(|block| block.outbox.drain(..)).collect()
    }

    pub fn load_program(&mut self, id: u16, source: &str) -> Errorable {
        self.seq.load(id, source).map_err(|cause| MachineError { cause })
    }

    /// Sends the message to the destination port.
    pub fn send_message(&mut self, message: Message) -> Errorable {
        // There might be more than one destination machine connected to a port.
        let recipients = self.resolve_port(message.port).ok_or(DisconnectedPort { port: message.port })?;

        // We submit different messages to each machines.
        for recipient_id in recipients {
            if let Ok(block) = self.mut_block(recipient_id) {
                match block.data {
                    // Send the message directly to the machine.
                    Machine { machine_id } => {
                        if let Some(m) = self.seq.get_mut(machine_id) {
                            m.inbox.push(message.clone());
                        }
                    }

                    _ => block.inbox.push(message.clone())
                }
            }
        }

        Ok(())
    }

    /// Sends the message to the specified block.
    pub fn send_message_to_block(&mut self, block_id: u16, action: Action) -> Errorable {
        let block = self.mut_block(block_id)?;
        block.inbox.push(Message { port: port(block_id, 60000), action });
        Ok(())
    }

    pub fn update_block(&mut self, id: u16, data: BlockData) -> Errorable {
        let block = self.mut_block(id)?;
        block.data = data;

        Ok(())
    }

    pub fn reset_blocks(&mut self) -> Errorable {
        // Collect the ids of the blocks that we can reset.
        // Machine block is handled separately, so we don't need to tick them.
        let ids: Vec<_> = self.blocks.iter().filter(|b| !b.data.is_machine()).map(|b| b.id).collect();

        for id in ids {
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
}
