use std::collections::HashMap;
use crate::str_to_u16;

/// Symbol table
#[derive(Clone, Debug)]
pub struct Symbols {
    /// Stores the memory offsets for values and strings.
    pub offsets: HashMap<String, u16>,

    /// Stores the strings.
    pub strings: HashMap<String, String>,

    /// Stores the raw bytes for raw data.
    pub data: HashMap<String, Vec<u16>>,
}

impl Symbols {
    pub fn new() -> Symbols {
        Symbols {
            offsets: HashMap::new(),
            strings: HashMap::new(),
            data: HashMap::new(),
        }
    }

    pub fn bytes(&self) -> Vec<u16> {
        let mut data: Vec<u16> = vec![];

        let mut write = |offset: usize, bytes: Vec<u16>| {
            let capacity = offset + bytes.len();

            if data.len() <= capacity {
                data.resize(capacity + 1, 0);
            }

            for (i, byte) in bytes.iter().enumerate() {
                data.insert(offset + i, *byte);
            }
        };

        for (key, offset) in self.offsets.iter() {
            let offset = *offset as usize;

            // it's a string.
            if self.strings.contains_key(key) {
                let value = self.strings.get(key).unwrap();
                write(offset, str_to_u16(value));
            }

            // It's raw bytes.
            if self.data.contains_key(key) {
                let value = self.data.get(key).unwrap();
                write(offset, value.clone());
            }
        }

        data
    }
}