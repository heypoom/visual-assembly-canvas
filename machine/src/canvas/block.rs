use serde::{Deserialize, Serialize};
use crate::{Event, Message};
use crate::audio::waveform::Waveform;
use crate::canvas::pixel::PixelMode;
use strum_macros::{EnumIs};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Block {
    pub id: u16,

    pub data: BlockData,

    pub inbox: Vec<Message>,
    pub outbox: Vec<Message>,
    pub events: Vec<Event>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, EnumIs)]
pub enum BlockData {
    MachineBlock {
        machine_id: u16,
    },

    PixelBlock {
        pixels: Vec<u16>,
        mode: PixelMode,
    },

    TapBlock {},

    /// Plots a graph out of the data it receives.
    PlotterBlock {
        data: Vec<u16>,

        /// Window size.
        size: u16,
    },

    /// Oscillator. Produces the value of a waveform at a given time.
    OscBlock {
        /// Current time of the oscillator.
        time: u16,

        /// Values produced by the oscillator.
        values: Vec<u16>,

        /// Current frequency of the oscillator.
        waveform: Waveform,
    },
}

impl Block {
    pub fn new(id: u16, data: BlockData) -> Block {
        Block { id, data, inbox: vec![], outbox: vec![], events: vec![] }
    }

    pub fn consume_messages(&mut self) -> Vec<Message> {
        self.inbox.drain(..).collect()
    }
}
