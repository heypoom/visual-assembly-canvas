use serde::{Deserialize, Serialize};
use crate::audio::midi::{MidiOutputEvent};

/// Events that can be sent by blocks and machines.
/// This event can be considered a side effect that will be executed by the host.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },

    /// Sends a MIDI message to the MIDI out device.
    Midi {
        event: MidiOutputEvent,
    },
}

