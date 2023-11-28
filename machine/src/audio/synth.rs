use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum SynthConfig {
    Basic,
    FM,
    AM,
    Noise,
    Poly { synth: Box<SynthConfig> },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Duration {
    /// Duration in seconds (e.g. 0.5)
    Sec(f32),

    /// e.g. 4 = quarter note
    Note(u8),

    /// e.g. 8 = eighth note triplet
    Triplet(u8),

    /// e.g. 1 = one measure
    Measure(u8),
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SynthTrigger {
    Attack {
        /// Note to play, in MIDI format
        note: u8,

        /// Time offset from start of frame
        time: f32,
    },

    Release {
        /// Time offset from start of frame
        time: f32
    },

    AttackRelease {
        /// Note to play, in MIDI format
        note: u8,

        /// How long should we hold the note?
        duration: Duration,

        /// Time offset from start of frame
        time: f32,
    },
}