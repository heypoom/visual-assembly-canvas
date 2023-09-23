use std::rc::Rc;
use crate::mem::{Memory, StackManager};
use crate::register::Registers;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,

    pub stack: StackManager
}

impl Machine {
    pub fn new() -> Machine {
        let mem = Memory::new();
        let reg = Registers::new();
        let stack = StackManager::new(Rc::new(mem), Rc::new(reg));

        Machine {
            mem,
            reg,
            stack
        }
    }
}
