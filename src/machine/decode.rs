use crate::machine::Machine;
use crate::instructions::Op;
use crate::register::Register::PC;

pub trait Decode {
    /// Get the current instruction from the code segment.
    fn opcode(&self) -> u16;

    /// Get a single argument from the code segment.
    fn arg(&mut self) -> u16;

    /// Returns the current instruction.
    /// Decodes the opcode and arguments into instruction.
    fn decode(&mut self) -> Op;
}

impl Decode for Machine {
    /// Fetch the current instruction from the code segment.
    fn opcode(&self) -> u16 {
        self.mem.get(self.reg.get(PC))
    }

    /// Get a single argument from the code segment.
    fn arg(&mut self) -> u16 {
        self.reg.inc(PC);
        self.opcode()
    }

    /// Returns the current instruction.
    /// Fetch and decode the opcode and its arguments into instruction.
    fn decode(&mut self) -> Op {
        // Fetch the opcode and decode it.
        let op: Op = self.opcode().into();

        // DEBUG: store the initial program counter.
        let initial_pc = if self.is_debug { self.reg.get(PC) } else { 0 };

        // Load the arguments into the instruction.
        let op = op.with_arg(|| self.arg());

        // DEBUG: log the program counter, instruction and raw instruction bytes.
        if self.is_debug {
            let raw = self.mem.read(initial_pc, (op.arity() + 1) as u16);
            println!("{:02} | {:?} | {:?}", initial_pc, op, raw);
        }

        op
    }
}