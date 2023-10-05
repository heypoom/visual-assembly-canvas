use crate::machine::{Decode, Machine};
use crate::register::Register::PC;
use crate::instructions::{Instruction as I};
use crate::mem::WithStringManager;

pub trait Execute {
    /// Execute an instruction.
    fn exec_op(&mut self, op: I);

    /// Executes the current instruction.
    fn tick(&mut self);

    /// Runs the machine until it halts.
    fn run(&mut self);

    /// Returns whether the machine should halt.
    fn should_halt(&self) -> bool;
}

impl Execute for Machine {
    /// Execute an instruction.
    fn exec_op(&mut self, op: I) {
        // Should we jump to a different instruction?
        let mut jump: Option<u16> = None;

        // Initialize the stack helper.
        let mut s = self.stack();

        match op {
            I::None => {}
            I::Halt => {}

            I::Push(v) => { s.push(v).expect("push error"); }
            I::Pop => { s.pop().expect("pop error"); }

            I::Load(addr) => {
                let v = self.mem.get(addr);
                self.stack().push(v).expect("load error");
            }

            I::Store(addr) => {
                let v = s.pop().expect("store read error");
                self.mem.set(addr, v);
            }

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

            I::Jump(addr) => self.reg.set(PC, addr),

            I::JumpZero(addr) => {
                if s.pop().unwrap() == 0 {
                    jump = Some(addr);
                }
            }

            I::JumpNotZero(addr) => {
                if s.pop().unwrap() != 0 {
                    jump = Some(addr);
                }
            }

            I::Dup => {
                let v = s.peek();
                s.push(v).unwrap();
            }

            I::Swap => {
                let a = s.pop().unwrap();
                let b = s.pop().unwrap();

                s.push(a).unwrap();
                s.push(b).unwrap();
            }

            I::Over => {
                let v = s.get(1);
                s.push(v).unwrap();
            }

            I::Print => {
                let addr = s.pop().unwrap();
                let text = self.mem.string().get_str(addr).expect("string decode error");

                for handler in &self.handlers.print {
                    handler(&text);
                }
            }

            I::LoadString(addr) => {
                let text = self.mem.string().get_str_bytes(addr);

                for v in text.iter() {
                    self.stack().push(*v).expect("push error");
                }
            }

            I::Call(address) => {
                let pc = self.reg.get(PC);

                self.call_stack().push(pc).unwrap();
                self.reg.set(PC, address);
            }

            I::Return => {
                let address = self.call_stack().pop().expect("cannot pop the return address");
                self.reg.set(PC, address);
            }
        };

        // Advance or jump the program counter.
        if let Some(addr) = jump {
            self.reg.set(PC, addr);
        } else {
            self.reg.inc(PC);
        }
    }

    // Fetch, decode and execute the instruction.
    fn tick(&mut self) {
        let instruction = self.decode();
        // println!("{:?}", instruction);

        self.exec_op(instruction);
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