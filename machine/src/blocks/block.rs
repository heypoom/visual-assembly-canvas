use std::collections::VecDeque;
use serde::{Deserialize, Serialize};
use crate::{Event, Message};
use crate::audio::waveform::Waveform;
use strum_macros::{EnumIs};
use crate::audio::midi::{MidiInputEvent, MidiOutputFormat};
use crate::audio::synth::SynthConfig;
use crate::blocks::pixel::PixelMode;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Block {
    pub id: u16,

    pub data: BlockData,

    pub inbox: VecDeque<Message>,
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

        /// We send a clock signal every nth ticks.
        freq: u16,
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

        port: u16,

        /// Do we want to filter only some channels?
        /// If empty, all channels will be accepted.
        channels: Vec<u16>,
    },

    /// MIDI Out. Sends a MIDI message to the MIDI Out device.
    MidiOut {
        /// Which format do we want to send the message in?
        format: MidiOutputFormat,

        channel: u16,
        port: u16,
    },

    /// Basic synthesizer.
    Synth {
        /// Synth configuration.
        config: SynthConfig,
    },

    /// Memory block. Machines can read and write to this block.
    Memory {
        /// Data stored in the memory block.
        values: Vec<u16>,

        /// Should the memory block be reset automatically?
        auto_reset: bool,
    },
}

impl Block {
    pub fn new(id: u16, data: BlockData) -> Block {
        Block { id, data, inbox: VecDeque::new(), outbox: vec![], events: vec![] }
    }

    pub fn consume_messages(&mut self) -> Vec<Message> {
        self.inbox.drain(..).collect()
    }
}
