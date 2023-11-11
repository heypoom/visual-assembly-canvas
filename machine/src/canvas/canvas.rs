use snafu::ensure;
use crate::canvas::block::BlockData::{MachineBlock, PixelBlock};
use crate::canvas::error::CanvasError::{BlockNotFound, DisconnectedPort, MachineError};
use crate::{Action, Message, Sequencer};
use crate::canvas::BlockIdInUseSnafu;
use crate::canvas::CanvasError::CannotFindWire;
use super::block::{Block, BlockData};
use super::error::{BlockNotFoundSnafu, CannotWireToItselfSnafu, CanvasError, MachineNotFoundSnafu};
use super::wire::{Port, Wire};

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
            MachineBlock { machine_id } => self.seq.remove(machine_id),

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
        self.add_block_with_id(id, MachineBlock { machine_id: id })?;

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
            MachineBlock { machine_id } => {
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

    pub fn get_block(&mut self, id: u16) -> Result<&Block, CanvasError> {
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
            PixelBlock { .. } => self.tick_pixel_block(id, messages)?,
            _ => {}
        }

        Ok(())
    }

    pub fn tick_pixel_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;
        let PixelBlock { pixels, append } = &mut block.data else { return Ok(()); };

        for message in messages {
            match message.action {
                // The "data" action is used to directly set the pixel data.
                Action::Data { body } => {
                    let is_append = *append;

                    // Clear the pixels if it is not append-only.
                    if !is_append {
                        pixels.clear();
                        pixels.extend(&body);
                        continue;
                    }

                    // Use the zero byte to remove pixels.
                    if is_append {
                        for byte in body {
                            if byte == 0 {
                                if !pixels.is_empty() {
                                    pixels.pop();
                                }
                                continue;
                            }

                            pixels.push(byte);
                        }
                    }
                }
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
                    MachineBlock { machine_id } => {
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

    pub fn update_block(&mut self, id: u16, data: BlockData) -> Errorable {
        let block = self.mut_block(id)?;
        block.data = data;

        Ok(())
    }
}
