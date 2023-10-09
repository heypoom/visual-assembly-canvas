use std::cell::RefCell;
use std::fmt::{Debug, Formatter};
use std::rc::Rc;
use crate::Message;

pub struct Handlers {
    pub print: Vec<Box<dyn Fn(&str)>>,
    pub message: Option<Rc<RefCell<dyn FnMut(Message)>>>,
}

impl Debug for Handlers {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("print").unwrap();
        Ok(())
    }
}

impl Handlers {
    pub fn new() -> Handlers {
        Handlers { print: vec![], message: None }
    }
}
