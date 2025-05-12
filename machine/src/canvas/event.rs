use crate::audio::midi::MidiOutputFormat;
use crate::audio::synth::SynthTrigger;
use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::wasm_bindgen;

/// Events that can be sent by blocks and machines.
/// This event can be considered a side effect that will be executed by the host.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type", rename = "Effect")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum Event {
    /// Print texts to screen.
    Print { text: String },

    /// Sends a MIDI message to the MIDI out device.
    Midi {
        format: MidiOutputFormat,
        data: Vec<u8>,
        channel: u8,
        port: u8,
    },

    /// Triggers a synthesizer message.
    Synth { triggers: Vec<SynthTrigger> },

    /// Pause the execution for X milliseconds at the host device
    Sleep { ms: u16 },
}
