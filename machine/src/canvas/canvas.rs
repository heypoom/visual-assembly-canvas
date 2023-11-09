use serde::{Deserialize, Serialize};
use snafu::ensure;
use super::block::Block;
use super::error::{CannotWireToItselfSnafu, CanvasError};
use super::wire::{Port, Wire};

type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
}

impl Canvas {
    fn add_block(&mut self, block: Block) {
        self.blocks.push(block);
    }

    fn add_wire(&mut self, source: Port, target: Port) -> Result<u16, CanvasError> {
        ensure!(source != target, CannotWireToItselfSnafu { port: source });

        // Do not add duplicate wires.
        if let Some(w) = self.wires.iter().find(|w| w.source == source || w.target == target) {
            return Ok(w.id);
        }

        let id = self.wires.len() as u16;
        self.wires.push(Wire { id, source, target });
        Ok(id)
    }
}
