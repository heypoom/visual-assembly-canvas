use std::fmt::{Debug, Formatter};
use crate::message::MessageEvent;

pub struct Handlers {
    pub print: Vec<Box<dyn Fn(&str)>>,
    pub message: Vec<Box<dyn Fn(MessageEvent)>>,
}

impl Debug for Handlers {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("print").unwrap();
        Ok(())
    }
}

impl Handlers {
    pub fn new() -> Handlers {
        Handlers { print: vec![], message: vec![] }
    }
}
