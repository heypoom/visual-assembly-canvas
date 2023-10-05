use snafu::prelude::*;
use snafu::Whatever;

use crate::mem::{Memory, MEMORY_SIZE};
use crate::register::{Register::SP, Registers};

pub const MIN_STACK_ADDR: u16 = 0x3000;
pub const MAX_STACK_ADDR: u16 = MEMORY_SIZE - 1;

#[derive(Debug)]
pub struct StackManager<'a> {
    mem: &'a mut Memory,
    reg: &'a mut Registers,
}

impl<'a> StackManager<'a> {
    pub fn new(mem: &'a mut Memory, reg: &'a mut Registers) -> StackManager<'a> {
        StackManager { mem, reg }
    }

    pub fn top(&self) -> u16 {
        self.reg.get(SP)
    }

    // Write a value to the top of the stack.
    pub fn write(&mut self, val: u16) {
        self.mem.set(self.top(), val);
    }

    pub fn push(&mut self, val: u16) -> Result<(), Whatever> {
        if self.top() > MAX_STACK_ADDR {
            whatever!("stack overflow")
        }

        // Increment the stack pointer.
        self.reg.inc(SP);

        // Save the value at the top of the stack.
        self.write(val);

        Ok(())
    }

    pub fn peek(&self) -> u16 {
        self.mem.get(self.top())
    }

    pub fn get(&self, index: u16) -> u16 {
        self.mem.get(self.top() - index)
    }

    pub fn pop(&mut self) -> Result<u16, Whatever> {
        if self.top() < MIN_STACK_ADDR {
            whatever!("stack underflow")
        }

        let v = self.peek();

        // Clear the value at the top of the stack.
        self.write(0);

        // Decrement the stack pointer.
        self.reg.dec(SP);

        // Return the value at the top of the stack.
        Ok(v)
    }

    pub fn apply<F>(&mut self, f: F)
        where F: FnOnce(u16) -> u16 {
        let a = self.pop().unwrap();
        let value = f(a);
        self.push(value).unwrap();
    }

    pub fn apply_two<F>(&mut self, f: F)
        where F: FnOnce(u16, u16) -> u16 {
        let a = self.pop().unwrap();
        let b = self.pop().unwrap();

        let value = f(a, b);
        self.push(value).unwrap();
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
