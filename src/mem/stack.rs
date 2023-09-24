use snafu::prelude::*;
use snafu::Whatever;

use crate::mem::Memory;
use crate::register::{Registers, Register::SP};

const MIN_STACK_ADDR: u16 = 0x3000;
const MAX_STACK_ADDR: u16 = 0xFFFF;

#[derive(Debug)]
pub struct StackManager<'a> {
    mem: &'a mut Memory,
    reg: &'a mut Registers
}

impl<'a> StackManager<'a> {
    pub fn new(mem: &'a mut Memory, reg: &'a mut Registers) -> StackManager<'a> {
        StackManager {
            mem,
            reg
        }
    }

    fn init(&mut self) {
        self.reg.set(SP, MAX_STACK_ADDR);
    }

    fn top(&self) -> u16 {
        self.reg.get(SP)
    }

    fn push(&mut self, val: u8) -> Result<(), Whatever> {
        if self.top() < MIN_STACK_ADDR {whatever!("stack overflow")}

        // Decrement the stack pointer.
        self.reg.dec(SP);

        // Save the value at the top of the stack.
        self.mem.set(self.top(), val);

        Ok(())
    }

    fn pop(&mut self) -> Result<u8, Whatever> {
        if self.top() > MAX_STACK_ADDR {whatever!("stack underflow")}

        let v = self.mem.get(self.top());

        // Increment the stack pointer.
        self.reg.inc(SP);

        // Return the value at the top of the stack.
        Ok(v)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::machine::Machine;

    #[test]
    fn test_stack() {
        let mut m = Machine::new();
        let mut s = StackManager::new(&mut m.mem, &mut m.reg);

        s.init();
        s.push(10).unwrap();
        s.push(20).unwrap();
        s.push(30).unwrap();
        assert_eq!(s.pop().unwrap(), 30);
        assert_eq!(s.pop().unwrap(), 20);
        s.push(40).unwrap();
        assert_eq!(s.pop().unwrap(), 40);
        assert_eq!(s.pop().unwrap(), 10);
    }
}