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

    /// Sends a control change message.
    ControlChange,

    /// Sends a SysEx message for Launchpad X's "DAW out" device.
    Launchpad,
}
