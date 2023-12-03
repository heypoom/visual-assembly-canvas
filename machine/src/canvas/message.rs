use serde::{Deserialize, Serialize};
use crate::audio::midi::{MidiInputEvent, MidiOutputFormat};
use crate::audio::waveform::Waveform;
use crate::blocks::pixel::PixelMode;
use crate::canvas::wire::Port;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Message {
    /// Action sent to the machine.
    pub action: Action,

    /// Address of the sender block.
    pub sender: Port,

    /// Address of the recipient block.
    /// If none, the message is sent to the devices connected to the sender port.
    pub recipient: Option<u16>,
}

/// Messages that can be sent between nodes and machines.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Action {
    /// Send information to the specified node.
    Data { body: Vec<u16> },

    /// Request to read from the specified address.
    Read { address: u16, count: u16 },

    /// Write to the specified address.
    Write { address: u16, data: Vec<u16> },

    /// Override all existing data.
    Override { data: Vec<u16> },

    /// Reset the node to its initial state.
    Reset,

    /// Notify the block that a MIDI message has been received.
    Midi { event: MidiInputEvent, note: u8, value: u8, channel: u8, port: u8 },

    /// Set the MIDI port
    SetMidiPort { port: u16 },

    /// Set the MIDI channels.
    SetMidiChannels { channels: Vec<u16> },

    /// Select the MIDI input event for the block to subscribe to.
    SetMidiInputEvent { event: MidiInputEvent },

    /// Set the MIDI output format.
    SetMidiOutputFormat { format: MidiOutputFormat },

    /// Set the waveform of the oscillator.
    SetWaveform { waveform: Waveform },

    /// Set the pixel mode of the pixel block.
    SetPixelMode { mode: PixelMode },

    /// Should the block reset via the reset command?
    SetAutoReset { auto_reset: bool },

    /// Set the clock's frequency
    SetClockFreq { freq: u16 },
}
