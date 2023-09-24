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
        Machine { mem: Memory::new(), reg: Registers::new() }
    }

    /// Returns a stack manager for the current machine.
    pub fn stack(&mut self) -> StackManager {
        StackManager::new(&mut self.mem, &mut self.reg)
    }
}

impl From<Vec<Instruction>> for Machine {
    fn from(code: Vec<Instruction>) -> Self {
        let mut m = Machine::new();
        m.mem.load_code(code);
        m
    }
}

#[cfg(test)]
mod tests {
    use crate::mem::WithStringManager;
    use super::*;

    type M = Machine;

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

    #[test]
    fn test_load_str() {
        let mut m = Machine::new();
        let mut ms = m.mem.string();

        let s = "hello";
        let h_ptr = ms.add_str(s);

        let mut ins: Vec<I> = vec![];

        for i in h_ptr..h_ptr + s.len() as u16 {
            ins.push(I::Load(i));
        }

        m.mem.load_code(ins);
        assert_eq!(m.mem.read_stack(5), [0, 0, 0, 0, 0]);

        m.run();
        assert_eq!(m.mem.read_stack(5), [111, 108, 108, 101, 104]);
    }
}
