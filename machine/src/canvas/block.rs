use serde::{Deserialize, Serialize};
use crate::{Event, Message};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub id: u16,

    pub data: BlockData,

    pub inbox: Vec<Message>,
    pub outbox: Vec<Message>,
    pub events: Vec<Event>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BlockData {
    MachineBlock {
        machine_id: u16,
    },

    PixelBlock {
        pixels: Vec<u16>
    },
}