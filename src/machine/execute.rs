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
        let mut s = self.stack();
        println!("Operation: {:?}", op);

        // Should we jump to a different instruction?
        let mut jump: Option<u16> = None;

        match op {
            I::None => {}

            I::Push(v) => { self.push(v); }
            I::Pop => { self.pop(); }

            // Addition, subtraction, multiplication and division.
            I::Add => s.apply_two(|a, b| a + b),
            I::Sub => s.apply_two(|a, b| b - a),
            I::Mul => s.apply_two(|a, b| a * b),
            I::Div => s.apply_two(|a, b| b / a),

            // Increment and decrement.
            I::Inc => s.apply(|v| v + 1),
            I::Dec => s.apply(|v| v - 1),

            // Equality and comparison operations.
            I::Equal => s.apply_two(|a, b| (a == b).into()),
            I::NotEqual => s.apply_two(|a, b| (a != b).into()),
            I::LessThan => s.apply_two(|a, b| (a < b).into()),
            I::LessThanOrEqual => s.apply_two(|a, b| (a <= b).into()),
            I::GreaterThan => s.apply_two(|a, b| (a > b).into()),
            I::GreaterThanOrEqual => s.apply_two(|a, b| (a >= b).into()),

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
                let v = s.peek();
                self.push(v);
            }

            I::Swap => {
                let a = self.pop();
                let b = self.pop();

                self.push(a);
                self.push(b);
            }

            I::Over => {
                let v = s.get(1);
                self.push(v);
            }

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