use serde::{Deserialize, Serialize};
use crate::{Event, Message};
use crate::audio::waveform::Waveform;
use crate::canvas::pixel::PixelMode;
use strum_macros::{EnumIs};
use crate::audio::midi::{MidiInputEvent, MidiOutputFormat};

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
    Machine {
        machine_id: u16,
    },

    Pixel {
        pixels: Vec<u16>,
        mode: PixelMode,
    },

    Tap {},

    /// Plots a graph out of the data it receives.
    Plot {
        values: Vec<u16>,

        /// Window size.
        size: u16,
    },

    Clock {
        /// Current time of the clock generator.
        time: u16,
    },

    /// Oscillator. Produces the value of a waveform, given a clock.
    Osc {
        /// Current frequency of the oscillator.
        waveform: Waveform,
    },

    /// MIDI In. Receives a MIDI message.
    MidiIn {
        /// Which MIDI message do we want to receive for this block?
        on: MidiInputEvent,
    },

    /// MIDI Out. Sends a MIDI message to the MIDI Out device.
    MidiOut {
        /// Which format do we want to send the MIDI message in?
        format: MidiOutputFormat,
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
