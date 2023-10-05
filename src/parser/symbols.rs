use std::collections::HashMap;

/// Symbol table
#[derive(Clone, Debug)]
pub struct Symbols {
    pub labels: HashMap<String, usize>,
}

impl Symbols {
    pub fn new() -> Symbols {
        Symbols {
            labels: HashMap::new(),
        }
    }
}