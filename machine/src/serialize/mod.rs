use serde::{Deserialize, Serialize};
use crate::canvas::block::Block;
use crate::canvas::wire::Wire;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SaveState {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
}
