use snafu::ensure;
use crate::Action;
use crate::blocks::{Block, BlockDataByType, InternalBlockData};
use crate::blocks::BlockDataByType::BuiltIn;
use crate::canvas::{Canvas, CanvasError};
use crate::blocks::InternalBlockData::{Machine, Memory};
use crate::canvas::canvas::Errorable;
use crate::canvas::CanvasError::{BlockNotFound};
use crate::canvas::{BlockIdInUseSnafu, MachineNotFoundSnafu};

impl Canvas {
    pub fn add_block(&mut self, data: BlockDataByType) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_block_with_id(id, data)?;

        Ok(id)
    }

    pub fn add_block_with_id(&mut self, id: u16, data: BlockDataByType) -> Errorable {
        // Prevent duplicate block ids from being added.
        ensure!(!self.blocks.iter().any(|b| b.id == id), BlockIdInUseSnafu {id});

        // Validate block data before adding them.
        match data {
            BuiltIn {data: Machine { machine_id }} => {
                ensure!(self.seq.get(machine_id).is_some(), MachineNotFoundSnafu { id: machine_id });
            }
            _ => {}
        }

        self.blocks.push(Block::new(id, data));

        Ok(())
    }

    pub fn remove_block(&mut self, id: u16) -> Errorable {
        let block_idx = self.blocks.iter().position(|b| b.id == id).ok_or(BlockNotFound { id })?;

        // Teardown logic
        match self.blocks[block_idx].data {
            // TODO: move the Machine block to be externals.
            BuiltIn {data: Machine { machine_id }} => {
                 self.seq.remove(machine_id)
            }
            _ => {}
        }

        // Remove blocks from the canvas.
        self.blocks.remove(block_idx);

        // Remove all wires connected to the block.
        self.wires.retain(|w| w.source.block != id && w.target.block != id);

        Ok(())
    }

    pub fn get_block(&self, id: u16) -> Result<&Block, CanvasError> {
        self.blocks.iter().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn built_in_by_id(&self, id: u16) -> Result<&InternalBlockData, CanvasError> {
        match self.get_block(id) {
            Ok(Block {data: BlockDataByType::BuiltIn {data}, .. }) => Ok(data),
            _ => Err(BlockNotFound { id })
        }
    }

    pub fn mut_block(&mut self, id: u16) -> Result<&mut Block, CanvasError> {
        self.blocks.iter_mut().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn add_machine(&mut self) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_machine_with_id(id)?;

        Ok(id)
    }

    pub fn add_machine_with_id(&mut self, id: u16) -> Errorable {
        self.seq.add(id);
        self.add_block_with_id(id, BuiltIn {data: Machine { machine_id: id }})?;

        Ok(())
    }

    pub fn update_built_in(&mut self, id: u16, next_data: InternalBlockData) -> Errorable {
        if (self.get_block(id)?.data.is_built_in()) {
            let block = self.mut_block(id)?;
            block.data = BlockDataByType::BuiltIn {data: next_data};
        }

        Ok(())
    }

    pub fn reset_blocks(&mut self) -> Errorable {
        // Collect the ids of the blocks that we can reset.
        // Machine blocks are handled separately, so we don't need to tick them.
        let ids: Vec<_> = self.blocks.iter().filter(|b| {
            match b.data {
                // TODO: move machine block to externals.
                BlockDataByType::BuiltIn { data: Machine { .. } } => false,
                _ => true,
            }
        }).map(|b| b.id).collect();

        for id in ids {
            // Do not reset if the block is not auto-reset.
            // This means the memory block is storing persistent data.
            if let Memory { auto_reset, .. } = self.built_in_by_id(id)? {
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

    fn block_id(&mut self) -> u16 {
        let id = self.block_id_counter;
        self.block_id_counter += 1;
        id
    }

    /// When we import existing blocks and wires to the canvas, we must recompute the id counter.
    pub fn recompute_id_counters(&mut self) {
        self.wire_id_counter = self.wires.iter().map(|x| x.id).max().unwrap_or(0) + 1;
        self.block_id_counter = self.blocks.iter().map(|x| x.id).max().unwrap_or(0) + 1;
    }
}