use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use tsify::Tsify;
use crate::audio::midi::{MidiOutputFormat};
use crate::audio::synth::SynthTrigger;

/// Events that can be sent by blocks and machines.
/// This event can be considered a side effect that will be executed by the host.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type")]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },

    /// Sends a MIDI message to the MIDI out device.
    Midi {
        format: MidiOutputFormat,
        data: Vec<u8>,
        channel: u8,
        port: u8,
    },

    /// Triggers a synthesizer message.
    Synth {
        triggers: Vec<SynthTrigger>,
    },
}

