use crate::audio::midi::{MidiInputEvent, MidiOutputFormat};
use crate::audio::synth::SynthConfig;
use crate::audio::waveform::Waveform;
use crate::blocks::pixel::PixelMode;
use crate::blocks::value_view::ValueVisualType;
use crate::{Event, Message};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use strum_macros::EnumIs;
use tsify::Tsify;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Block {
    pub id: u16,
    pub data: BlockDataByType,

    pub inbox: VecDeque<Message>,
    pub outbox: Vec<Message>,
    pub events: Vec<Event>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, EnumIs, Tsify)]
#[serde(tag = "type")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum BlockDataByType {
    /// Built-in blocks.
    BuiltIn { data: InternalBlockData },

    /// External blocks.
    External {
        /// Unique identifier of the external block.
        name: String,

        /// Shared data is stored in the MessagePack value format.
        /// Optional. You can rely on message passing and not share data.
        #[serde(with = "serde_bytes")]
        data: Vec<u8>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, EnumIs, Tsify)]
#[serde(tag = "type")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum InternalBlockData {
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

        /// Send a "ping" packet instead of the time.
        ping: bool,
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

    /// Remote value viewer. Used for visualizing and inspecting values.
    ValueView {
        /// Identifier of the target machine or block.
        target: u16,

        /// The starting memory address.
        offset: u16,

        /// How many values to use?
        size: u16,

        /// How should we visualize this value?
        visual: ValueVisualType,

        /// Color of the memory region.
        color: u16,
    },
}

impl Block {
    pub fn new(id: u16, data: BlockDataByType) -> Block {
        Block {
            id,
            data,
            inbox: VecDeque::new(),
            outbox: vec![],
            events: vec![],
        }
    }

    pub fn consume_messages(&mut self) -> Vec<Message> {
        self.inbox.drain(..).collect()
    }
}
