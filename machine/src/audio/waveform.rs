use std::f32::consts::PI;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// Types of waveforms the oscillator can produce.
#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize, Hash, Tsify)]
#[serde(tag = "type")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Waveform {
    Sine,
    Cosine,
    Tangent,

    Square {
        duty_cycle: u16,
    },

    Sawtooth,
    Triangle,
    Noise,
}

static MAX_F: f32 = 255.0;
static MAX_U: u16 = 255;
static HALF: f32 = 255.0 / 2.0;

pub fn to_u16(v: f32) -> u16 {
    v.round() as u16
}

pub fn to_wave(v: f32) -> u16 {
    to_u16((v + 1.0) * HALF)
}

pub fn angular(n: u16) -> f32 {
    2.0 * PI * (n as f32) / MAX_F
}

pub fn sine_wave(n: u16) -> u16 {
    to_wave(angular(n).sin())
}

pub fn cosine_wave(n: u16) -> u16 {
    to_wave(angular(n).cos())
}

pub fn tangent_wave(n: u16) -> u16 {
    to_wave(angular(n).tan())
}

pub fn sawtooth_wave(n: u16) -> u16 {
    n % MAX_U
}

pub fn square_wave(time: u16, duty_cycle: u16) -> u16 {
    let threshold = MAX_U * duty_cycle / MAX_U;

    if time < threshold {
        0
    } else {
        MAX_U
    }
}

pub fn triangle_wave(time: u16) -> u16 {
    if time <= 127 {
        time * 2
    } else {
        (MAX_U - time) * 2
    }
}

pub fn generate_waveform(waveform: Waveform, time: u16) -> u16 {
    match waveform {
        Waveform::Sine => sine_wave(time),
        Waveform::Square { duty_cycle } => square_wave(time, duty_cycle),
        Waveform::Cosine => cosine_wave(time),
        Waveform::Tangent => tangent_wave(time),
        Waveform::Sawtooth => sawtooth_wave(time),
        Waveform::Triangle => triangle_wave(time),
        Waveform::Noise => 0,
    }
}

#[cfg(test)]
mod waveform_tests {
    use crate::audio::waveform::sine_wave;

    #[test]
    fn sine_test() {
        assert_eq!(sine_wave(0), 128);
        assert_eq!(sine_wave(50), 248);
    }
}