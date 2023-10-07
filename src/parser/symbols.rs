use std::collections::HashMap;

/// Symbol table
#[derive(Clone, Debug)]
pub struct Symbols {
    /// Identifier name to string value.
    pub strings: HashMap<String, String>,

    /// Identifier to memory offsets and values.
    /// Used for strings and values.
    pub data: HashMap<String, usize>,
}

impl Symbols {
    pub fn new() -> Symbols {
        Symbols {
            strings: HashMap::new(),
            data: HashMap::new(),
        }
    }
}