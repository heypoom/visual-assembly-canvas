use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum SynthConfig {
    Basic,
    FM,
    AM,
    Noise,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SynthTrigger {
    Attack {
        /// Frequency of the note.
        freq: f32,

        /// Time offset from start of frame, in seconds.
        time: f32,
    },

    Release {
        /// Time offset from start of frame, in seconds.
        time: f32
    },

    AttackRelease {
        /// Frequency of the note.
        freq: f32,

        /// How long should we hold the note, in seconds.
        duration: f32,

        /// Time offset from start of frame, in seconds.
        time: f32,
    },
}

pub fn note_to_freq(note: u8) -> f32 {
    440.0 * 2f32.powf((note as f32 - 69.0) / 12.0)
}