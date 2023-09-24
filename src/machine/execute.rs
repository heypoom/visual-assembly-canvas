use snafu::Whatever;
use crate::machine::Machine;
use crate::register::Register::PC;
use crate::instructions::{Instruction as I};

pub trait Execute {
    fn tick(&mut self) -> Result<(), Whatever>;
    fn run(&mut self);
}

impl Execute for Machine {
    /// Executes the current instruction.
    fn tick(&mut self) -> Result<(), Whatever> {
        let op = self.instruction();
        println!("Operation: {:?}", op);

        // Whether we should jump to the address.
        let mut jump: Option<u16> = None;

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

                self.push(b - a);
            }

            I::Mul => {
                let a = self.pop();
                let b = self.pop();

                self.push(a * b);
            }

            I::Div => {
                let a = self.pop();
                let b = self.pop();

                self.push(b / a);
            }

            I::StartLoop => {}

            I::EndLoop(start) => {
                self.reg.set(PC, start);
            }

            I::Jump(addr) => {
                self.reg.set(PC, addr);
            }

            I::JumpZero(addr) => {
                if self.pop() == 0 {
                    jump = Some(addr);
                }
            }

            I::JumpNotZero(addr) => {
                if self.pop() != 0 {
                    jump = Some(addr);
                }
            }

            I::Inc => {
                let v = self.pop();
                self.push(v + 1)
            }

            I::Dec => {
                let v = self.pop();
                self.push(v - 1)
            }

            I::Dup => {
                let v = self.stack().peek();
                self.push(v);
            }

            I::Swap => {
                let a = self.pop();
                let b = self.pop();

                self.push(a);
                self.push(b);
            }

            I::Over => {
                let v = self.stack().get(1);
                self.push(v);
            }

            I::Halt => {}
        };

        if let Some(addr) = jump {
            self.reg.set(PC, addr);
        } else {
            self.reg.inc(PC);
        }

        Ok(())
    }

    fn run(&mut self) {
        while !self.should_halt() {
            self.tick().unwrap();
        }
    }
}