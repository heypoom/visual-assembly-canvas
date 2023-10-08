use crate::machine::{Decode, Machine};
use crate::register::Register::PC;
use crate::op::Op;
use crate::mem::WithStringManager;
use crate::message::MessageEvent;

pub trait Execute {
    /// Execute an instruction.
    fn exec_op(&mut self, op: Op);

    /// Executes the current instruction.
    fn tick(&mut self);

    /// Runs the machine until it halts.
    fn run(&mut self);

    /// Returns whether the machine should halt.
    fn should_halt(&self) -> bool;
}

impl Execute for Machine {
    /// Execute an instruction.
    fn exec_op(&mut self, op: Op) {
        // Should we jump to a different instruction?
        let mut jump: Option<u16> = None;

        // Initialize the stack helper.
        let mut s = self.stack();

        match op {
            Op::Noop => {}
            Op::Halt => {}
            Op::Eof => {}

            Op::Push(v) => { s.push(v).expect("push error"); }
            Op::Pop => { s.pop().expect("pop error"); }

            Op::Load(addr) => {
                let v = self.mem.get(addr);
                self.stack().push(v).expect("load error");
            }

            Op::Store(addr) => {
                let v = s.pop().expect("store read error");
                self.mem.set(addr, v);
            }

            // Addition, subtraction, multiplication and division.
            Op::Add => s.apply_two(|a, b| a + b),
            Op::Sub => s.apply_two(|a, b| b - a),
            Op::Mul => s.apply_two(|a, b| a * b),
            Op::Div => s.apply_two(|a, b| b / a),

            // Increment and decrement.
            Op::Inc => s.apply(|v| v + 1),
            Op::Dec => s.apply(|v| v - 1),

            // Equality and comparison operations.
            Op::Equal => s.apply_two(|a, b| (a == b).into()),
            Op::NotEqual => s.apply_two(|a, b| (a != b).into()),
            Op::LessThan => s.apply_two(|a, b| (a < b).into()),
            Op::LessThanOrEqual => s.apply_two(|a, b| (a <= b).into()),
            Op::GreaterThan => s.apply_two(|a, b| (a > b).into()),
            Op::GreaterThanOrEqual => s.apply_two(|a, b| (a >= b).into()),

            // TODO: write a unit test for jump, and op that uses jump.
            //       there was a bug caused by using set(PC) instead of assigning to jump
            Op::Jump(addr) => {
                jump = Some(addr);
            }

            Op::JumpZero(addr) => {
                if s.pop().unwrap() == 0 {
                    jump = Some(addr);
                }
            }

            Op::JumpNotZero(addr) => {
                if s.pop().unwrap() != 0 {
                    jump = Some(addr);
                }
            }

            Op::Dup => {
                let v = s.peek();
                s.push(v).unwrap();
            }

            Op::Swap => {
                let a = s.pop().unwrap();
                let b = s.pop().unwrap();

                s.push(a).unwrap();
                s.push(b).unwrap();
            }

            Op::Over => {
                let v = s.get(1);
                s.push(v).unwrap();
            }

            Op::Print => {
                let mut bytes = vec![];

                while let Ok(v) = s.pop() {
                    if v == 0 { break; }
                    bytes.push(v);
                }

                // The op are popped in reverse-order.
                bytes.reverse();

                let text = self.mem.string().get_str_from_bytes(bytes).expect("invalid string");

                for handler in &self.handlers.print {
                    handler(&text);
                }
            }

            Op::LoadString(addr) => {
                let text = self.mem.string().get_str_bytes(addr);

                for v in text.iter() {
                    self.stack().push(*v).expect("push error");
                }
            }

            Op::Call(address) => {
                let pc = self.reg.get(PC);

                self.call_stack().push(pc).expect("call stack exceeded");
                jump = Some(address);
            }

            Op::Return => {
                let address = self.call_stack().pop().expect("cannot pop the return address");

                // Return to to the return address, plus one.
                jump = Some(address + 1);
            }

            Op::Send(to, size) => {
                let mut packet = vec![];

                for _ in 0..size {
                    packet.push(s.pop().expect("packet does not exist in stack"));
                }

                for msg_handler in &self.handlers.message {
                    msg_handler(MessageEvent::Send {
                        from: self.id.unwrap_or(0),
                        to,
                        bytes: packet.clone(),
                    });
                }
            }

            Op::MemoryMap(_port, _start, _size) => {}
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
        let op = self.decode();
        self.exec_op(op);
    }

    fn run(&mut self) {
        while !self.should_halt() {
            self.tick();
        }
    }

    fn should_halt(&self) -> bool {
        let op: Op = self.opcode().into();

        op == Op::Halt || op == Op::Eof
    }
}