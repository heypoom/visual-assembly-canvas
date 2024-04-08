use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use tsify::Tsify;
use crate::audio::midi::{MidiOutputFormat};
use crate::audio::synth::SynthTrigger;

/// Events that can be sent by blocks and machines.
/// This event can be considered a side effect that will be executed by the host.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type", rename = "Effect")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
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

    /// Pause the execution at the host device
    Sleep {
        duration: SleepDuration,
    },
}

#[derive(Tsify, Debug, Serialize, Deserialize, PartialEq, Clone)]
#[serde(tag = "type", rename_all = "camelCase")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum SleepDuration {
    Ms(u16),
    Tick(u16),
}

