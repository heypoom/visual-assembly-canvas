use std::rc::Rc;

use crate::mem::Memory;
use crate::register::{Registers, Register, Register::SP};

const MIN_STACK_ADDR: usize = 0x1000;
const MAX_STACK_ADDR: usize = 0xFFFF;

pub struct StackManager {
    mem: Rc<Memory>,
    reg: Rc<Registers>
}

impl StackManager {
    pub(crate) fn new(mem: Rc<Memory>, reg: Rc<Registers>) -> StackManager {
        StackManager {
            mem,
            reg
        }
    }

    fn init(&mut self) {
        self.reg.set(SP, MAX_STACK_ADDR as u8);
    }

    fn top(&self) -> usize {
        self.reg.get(SP) as usize
    }

    fn push(&mut self, val: u8) {
        // Stack Overflow!
        // TODO: handle stack overflow.
        // TODO: handle heap and stack collision.
        if self.top() > MAX_STACK_ADDR {return}

        // Increment the stack pointer.
        self.reg.inc(SP);
        self.mem.set(self.top(), val);
    }

    fn pop(&mut self) -> Option<u8> {
        // Stack Underflow!
        if self.top() < MIN_STACK_ADDR {
            return None;
        }

        // Decrement the stack pointer.
        self.reg.dec(SP);

        // Return the value at the top of the stack.
        Some(self.mem.get(SP as usize))
    }
}
