use std::f32::consts::PI;

pub fn sine_wave(n: u16) -> u16 {
    return ((127.5 * (2.0 * PI * (n as f32) / 65535.0).sin() + 127.5).round()) as u16
}

#[cfg(test)]
mod waveform_tests {
    use crate::audio::waveform::sine_wave;

    #[test]
    fn sine_test() {
        let w = sine_wave(0);

        println!()
    }
}