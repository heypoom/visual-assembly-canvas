use std::fmt::{Debug, Formatter};

pub struct Handlers {
    pub print: Vec<Box<dyn Fn(&str)>>,
}

impl Debug for Handlers {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("print").unwrap();
        Ok(())
    }
}

impl Handlers {
    pub fn new() -> Handlers {
        Handlers { print: vec![] }
    }
}
