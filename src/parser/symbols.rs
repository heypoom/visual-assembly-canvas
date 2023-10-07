use std::collections::HashMap;

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
}