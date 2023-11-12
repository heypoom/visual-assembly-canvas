use std::f32::consts::PI;
use serde::{Deserialize, Serialize};

/// Types of waveforms the oscillator can produce.
#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum Waveform {
    Sine,

    Square {
        duty_cycle: u16,
    },

    Sawtooth,
    Triangle,
    Noise,
}

/// 127.5 * (1 + sin(2 * π * x / 255))
pub fn sine_wave(n: u16) -> u16 {
    ((255.0 / 2.0) * (1.0 + f32::sin(2.0 * PI * (n as f32) / 255.0))).round() as u16
}

pub fn generate_waveform(waveform: Waveform, time: u16) -> u16 {
    match waveform {
        Waveform::Sine => sine_wave(time),
        Waveform::Square { .. } => 0,
        Waveform::Sawtooth => 0,
        Waveform::Triangle => 0,
        Waveform::Noise => 0,
    }
}

#[cfg(test)]
mod waveform_tests {
    use crate::audio::waveform::sine_wave;

    #[test]
    fn sine_test() {
        let v: Vec<_> = (0..255).map(|x| sine_wave(x)).collect();
    }
}