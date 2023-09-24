mod execute;

use crate::instructions::{Instruction as I, Instruction, Load};
use crate::mem::{Memory, StackManager};
use crate::register::Register::PC;
use crate::register::Registers;

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

    /// Returns the current program counter.
    fn pc(&self) -> u16 { self.reg.get(PC) }

    /// Pops a value from the stack.
    fn pop(&mut self) -> u16 {
        self.stack().pop().unwrap()
    }

    /// Pushes a value onto the stack.
    fn push(&mut self, value: u16) {
        self.stack().push(value).unwrap();
    }

    /// Get the current instruction from the code segment.
    fn opcode(&self) -> u16 {
        self.mem.get(self.pc())
    }

    /// Get a single argument from the code segment.
    fn arg(&mut self) -> u16 {
        self.reg.inc(PC);

        self.opcode()
    }

    fn should_halt(&self) -> bool {
        let i: I = self.opcode().into();

        i == I::Halt
    }

    /// Returns the current instruction.
    /// Decodes the opcode and arguments into instruction.
    fn instruction(&mut self) -> I {
        let i: I = self.opcode().into();

        match i {
            I::Push(_) => I::Push(self.arg()),
            _ => i
        }
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

        m.tick().unwrap();
        m.tick().unwrap();
        assert_eq!(m.mem.read_stack(3), [0, 10, 5]);

        m.tick().unwrap();
        assert_eq!(m.mem.read_stack(3), [0, 0, 15]);

        m.tick().unwrap();
        assert_eq!(m.stack().peek(), 3);

        m.tick().unwrap();
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
        assert_eq!(m.mem.read_stack(2), [0, 1]);

        let mut m: M = vec![I::Push(5), I::Push(2), I::Equal].into();
        m.run();
        assert_eq!(m.mem.read_stack(2), [0, 0]);
    }
}
