use crate::instructions::Instruction as I;
use crate::mem::{Memory, StackManager};
use crate::register::Register::{PC, SP};
use crate::register::Registers;
use snafu::Whatever;

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

    fn pc(&self) -> u16 { self.reg.get(PC) }
    fn sp(&self) -> u16 { self.reg.get(SP) }

    /// Pops a value from the stack.
    fn pop(&mut self) -> u16 {
        self.stack().pop().unwrap()
    }

    /// Pushes a value onto the stack.
    fn push(&mut self, value: u16) {
        self.stack().push(value).unwrap();
    }

    fn mem(&self) -> u16 {
        self.mem.get(self.pc())
    }

    fn arg(&mut self) -> u16 {
        self.reg.inc(PC);

        self.mem()
    }

    /// Returns the current instruction.
    /// Decodes the opcode and arguments into instruction.
    fn instruction(&mut self) -> I {
        let i: I = self.mem().into();

        match i {
            I::Push(_) => I::Push(self.arg()),
            _ => i
        }
    }

    /// Executes the current instruction.
    pub fn tick(&mut self) -> Result<(), Whatever> {
        let op = self.instruction();
        println!("Operation: {:?}", op);

        match op {
            I::None => {}

            I::Push(v) => {
                self.push(v);
            }

            I::Pop => {
                self.pop();
            }

            I::Add => {
                let a = self.pop();
                let b = self.pop();

                self.push(a + b);
            }

            I::Sub => {
                let a = self.pop();
                let b = self.pop();

                self.push(a - b);
            }

            I::Mul => {
                let a = self.pop();
                let b = self.pop();

                self.push(a * b);
            }

            I::Div => {
                let a = self.pop();
                let b = self.pop();

                self.push(a / b);
            }

            I::Halt => {}
        };

        self.reg.inc(PC);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::instructions::Load;

    #[test]
    fn test_add() {
        let mut m = Machine::new();
        m.mem.load_code(vec![I::Push(5), I::Push(10), I::Add]);

        m.tick().unwrap();
        m.tick().unwrap();
        m.tick().unwrap();

        assert_eq!(m.pop(), 15);
    }
}
