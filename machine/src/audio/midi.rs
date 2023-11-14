use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MidiInputEvent {
    NoteOn,
    NoteOff,
    ControlChange,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MidiOutputFormat {
    /// Sends raw MIDI bytes. Can include SysEx messages.
    Raw,

    /// Sends a note and velocity to the MIDI out device.
    Note,

    /// Sends a SysEx message for Launchpad X's "DAW out" device.
    Launchpad,
}

/// MIDI output events.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MidiOutputEvent {
    /// Asks the host to setup a MIDI device.
    Setup {
        /// What are the outputs format of the MIDI we will be using?
        /// For Launchpad, we enable SysEx and the programmer layout automatically.
        formats: Vec<MidiOutputFormat>,
    },

    /// Sends a raw MIDI message.
    Raw {
        message: Vec<u8>,
    },

    /// Sends a MIDI note.
    Note {
        note: u8,
        velocity: u8,
    },

    /// Sends a MIDI control change message.
    ControlChange {
        control: u8,
        value: u8,
    },
}