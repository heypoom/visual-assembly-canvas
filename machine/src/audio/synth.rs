use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SynthConfig {
    Basic,
    FM,
    AM,
    Noise,
    Poly { synth: Box<SynthConfig> },
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Note {
    /// Frequency in hertz (e.g. 440.0)
    Freq(f32),

    /// Pitch-octave notation (e.g. A4)
    Pitch(String),
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
        note: Note,
        time: f32,
    },

    Release {
        time: Option<f32>
    },

    AttackRelease {
        note: Note,
        duration: Duration,
        time: Option<f32>,
    },
}