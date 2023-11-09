use snafu::ensure;
use crate::canvas::block::BlockData::{MachineBlock, PixelBlock};
use crate::canvas::error::CanvasError::BlockNotFound;
use crate::{Action, Machine};
use super::block::{Block, BlockData};
use super::error::{BlockNotFoundSnafu, CannotWireToItselfSnafu, CanvasError, MachineNotFoundSnafu};
use super::wire::{Port, Wire};

type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
    pub machines: Vec<Machine>,
}

impl Canvas {
    pub fn new() -> Canvas {
        Canvas {
            blocks: vec![],
            wires: vec![],
            machines: vec![],
        }
    }

    pub fn add_machine(&mut self) -> Result<u16, CanvasError> {
        let id = self.machines.len() as u16;
        let mut machine = Machine::new();
        machine.id = Some(id);

        self.machines.push(machine);
        self.add_block(MachineBlock { machine_id: id })?;

        Ok(id)
    }

    pub fn add_block(&mut self, data: BlockData) -> Result<u16, CanvasError> {
        let id = self.blocks.len() as u16;

        // Validate block data before adding them.
        match data {
            MachineBlock { machine_id } => {
                ensure!(self.machines.iter().any(|m| m.id == Some(machine_id)), MachineNotFoundSnafu { id: machine_id });
            }
            _ => {}
        }

        self.blocks.push(Block::new(id, data));

        Ok(id)
    }

    pub fn connect(&mut self, source: Port, target: Port) -> Result<u16, CanvasError> {
        ensure!(source != target, CannotWireToItselfSnafu { port: source });

        // Do not add duplicate wires.
        if let Some(w) = self.wires.iter().find(|w| w.source == source || w.target == target) {
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

        let id = self.wires.len() as u16;
        self.wires.push(Wire { id, source, target });
        Ok(id)
    }

    pub fn get_block(&mut self, id: u16) -> Result<&Block, CanvasError> {
        self.blocks.iter().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn mut_block(&mut self, id: u16) -> Result<&mut Block, CanvasError> {
        self.blocks.iter_mut().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn tick(&mut self) -> Errorable {
        let ids: Vec<u16> = self.blocks.iter().map(|b| b.id).collect();

        for id in ids {
            self.tick_block(id)?
        }

        Ok(())
    }

    pub fn tick_block(&mut self, id: u16) -> Errorable {
        let block = self.get_block(id)?;

        match &block.data {
            MachineBlock { .. } => {}
            PixelBlock { .. } => self.tick_pixel_block(id)?
        }

        Ok(())
    }

    pub fn tick_pixel_block(&mut self, id: u16) -> Errorable {
        let block = self.mut_block(id)?;
        let messages = block.read_messages();

        let PixelBlock { pixels } = &mut block.data else { return Ok(()); };

        for message in messages {
            match message.action {
                Action::Data { body } => {
                    pixels.copy_from_slice(&body);
                }
            }
        }

        Ok(())
    }
}
