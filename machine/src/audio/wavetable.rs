use std::collections::HashMap;
use crate::audio::waveform::{generate_waveform, Waveform};

#[derive(Debug, Clone, Default)]
pub struct Wavetable {
    pub cache: HashMap<Waveform, Vec<u16>>,

    pub square_duty: u16,
}

const MAX_RANGE: u16 = 255;

impl Wavetable {
    pub fn new() -> Wavetable {
        Wavetable { cache: HashMap::new(), square_duty: 0 }
    }

    pub fn get(&mut self, waveform: Waveform, time: u16) -> u16 {
        // Generate the waveform if it doesn't exist, or if their parameters have changed.
        if self.cache.get(&waveform).is_none() || self.changed(waveform) {
            self.generate(waveform);
        }

        // If the waveform exists in the wavetable, return the value.
        if let Some(cache) = self.cache.get(&waveform) {
            if let Some(value) = cache.get(time as usize) {
                return *value;
            }
        }

        // if time is within the range of the wavetable, something is wrong!
        if time <= MAX_RANGE { return 0; }

        // fallback to generating the waveform if value is out of bounds.
        generate_waveform(waveform, time)
    }

    pub fn generate(&mut self, waveform: Waveform) {
        let mut cache = Vec::with_capacity((MAX_RANGE + 1) as usize);

        for time in 0..=MAX_RANGE {
            cache.push(generate_waveform(waveform, time));
        }

        self.cache.insert(waveform, cache);
    }

    fn changed(&mut self, waveform: Waveform) -> bool {
        match waveform {
            Waveform::Square { duty_cycle } => {
                if self.square_duty != duty_cycle {
                    self.square_duty = duty_cycle;
                    return true;
                }
            }
            _ => {}
        }

        false
    }
}