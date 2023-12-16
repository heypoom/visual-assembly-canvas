use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum MidiInputEvent {
    NoteOn,
    NoteOff,
    ControlChange,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
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
