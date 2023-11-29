use std::collections::HashMap;
use crate::audio::waveform::{generate_waveform, Waveform};

#[derive(Debug, Clone)]
pub struct Wavetable {
    pub cache: HashMap<Waveform, Vec<u16>>,
}

impl Wavetable {
    pub fn new() -> Wavetable {
        Wavetable { cache: HashMap::new() }
    }

    pub fn generate(&mut self, waveform: Waveform, time: u16) -> u16 {
        // Lookup the cache.
        match self.cache.get(&waveform) {
            Some(cache) => {
                if let Some(value) = cache.get(time as usize) {
                    return *value;
                }
            }
            None => {
                self.cache.insert(waveform, vec![0; 256]);
            }
        }

        let cache = self.cache.get_mut(&waveform).unwrap();
        let value = generate_waveform(waveform, time);
        cache.insert(time as usize, value);

        value
    }
}