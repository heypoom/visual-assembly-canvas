mod decode;
mod execute;

use crate::instructions::{Instruction as I, Instruction, Load};
use crate::mem::{Memory, StackManager};
use crate::register::Registers;

pub use self::decode::Decode;
pub use self::execute::Execute;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
}

impl Machine {
    /// Creates a new machine.
    pub fn new() -> Machine {
        let mem = Memory::new();
        let reg = Registers::new();

        Machine { mem, reg }
    }

    /// Returns a stack manager for the current machine.
    fn stack(&mut self) -> StackManager {
        StackManager::new(&mut self.mem, &mut self.reg)
    }

    /// Pops a value from the stack.
    fn pop(&mut self) -> u16 {
        self.stack().pop().unwrap()
    }

    /// Pushes a value onto the stack.
    fn push(&mut self, value: u16) {
        self.stack().push(value).unwrap();
    }

    pub fn load(&mut self, ops: Vec<I>) {
        // Append a [halt] instruction to the code.
        let mut code = ops.clone();
        code.push(I::Halt);

        self.mem.load_code(code);
    }
}

impl From<Vec<Instruction>> for Machine {
    fn from(code: Vec<Instruction>) -> Self {
        let mut m = Machine::new();
        m.load(code);
        m
    }
}

type M = Machine;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        let mut m: M = vec![I::Push(5), I::Push(10), I::Add, I::Push(3), I::Sub].into();

        m.tick();
        m.tick();
        assert_eq!(m.mem.read_stack(3), [0, 10, 5]);

        m.tick();
        assert_eq!(m.mem.read_stack(3), [0, 0, 15]);

        m.tick();
        assert_eq!(m.stack().peek(), 3);

        m.tick();
        assert_eq!(m.mem.read_stack(3), [0, 0, 12]);
    }

    #[test]
    fn test_run() {
        let mut m: M = vec![I::Push(10), I::Push(3), I::Sub].into();
        m.run();
        assert_eq!(m.mem.read_stack(2), [0, 7]);
    }

    #[test]
    fn test_eq() {
        let mut m: M = vec![I::Push(10), I::Push(10), I::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![I::Push(5), I::Push(2), I::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 0);
    }

    #[test]
    fn test_le_ge() {
        let mut m: M = vec![I::Push(5), I::Push(2), I::LessThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![I::Push(2), I::Push(5), I::GreaterThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);
    }
}
