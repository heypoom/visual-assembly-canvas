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

/// Note or frequency.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SynthValue {
    /// MIDI note.
    Note(u8),

    // Frequency in Hz
    Freq(u16),
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SynthTrigger {
    Attack {
        value: SynthValue,

        /// Time offset from start of frame
        time: f32,
    },

    Release {
        /// Time offset from start of frame
        time: f32
    },

    AttackRelease {
        value: SynthValue,

        /// How long should we hold the note?
        duration: Duration,

        /// Time offset from start of frame
        time: f32,
    },
}