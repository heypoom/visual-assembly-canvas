use crate::machine::{Decode, Machine};
use crate::register::Register::PC;
use crate::instructions::{Instruction as I};

pub trait Execute {
    /// Executes the current instruction.
    fn tick(&mut self);

    /// Runs the machine until it halts.
    fn run(&mut self);

    /// Returns whether the machine should halt.
    fn should_halt(&self) -> bool;
}

impl Execute for Machine {
    fn tick(&mut self) {
        let op = self.decode();
        println!("Operation: {:?}", op);

        // Whether we should jump to the address.
        let mut jump: Option<u16> = None;

        match op {
            I::None => {}

            I::Push(v) => { self.push(v); }
            I::Pop => { self.pop(); }

            // Addition, subtraction, multiplication and division.
            I::Add => self.stack().apply_two(|a, b| a + b),
            I::Sub => self.stack().apply_two(|a, b| b - a),
            I::Mul => self.stack().apply_two(|a, b| a * b),
            I::Div => self.stack().apply_two(|a, b| b / a),

            I::StartLoop => {}

            I::EndLoop(start) => self.reg.set(PC, start),
            I::Jump(addr) => self.reg.set(PC, addr),

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

            I::Inc => self.stack().apply(|v| v + 1),
            I::Dec => self.stack().apply(|v| v - 1),

            I::Equal => self.stack().apply_two(|a, b| (a == b).into()),
            I::NotEqual => self.stack().apply_two(|a, b| (a != b).into()),
            I::LessThan => self.stack().apply_two(|a, b| (a < b).into()),
            I::LessThanOrEqual => self.stack().apply_two(|a, b| (a <= b).into()),
            I::GreaterThan => self.stack().apply_two(|a, b| (a > b).into()),
            I::GreaterThanOrEqual => self.stack().apply_two(|a, b| (a >= b).into()),

            I::Halt => {}
        };

        if let Some(addr) = jump {
            self.reg.set(PC, addr);
        } else {
            self.reg.inc(PC);
        }
    }

    fn run(&mut self) {
        while !self.should_halt() {
            self.tick();
        }
    }

    fn should_halt(&self) -> bool {
        let i: I = self.opcode().into();

        i == I::Halt
    }
}