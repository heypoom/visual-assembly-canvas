use crate::machine::Machine;
use crate::instructions::Instruction as I;
use crate::register::Register::PC;

pub trait Decode {
    /// Get the current instruction from the code segment.
    fn opcode(&self) -> u16;

    /// Get a single argument from the code segment.
    fn arg(&mut self) -> u16;

    /// Returns the current instruction.
    /// Decodes the opcode and arguments into instruction.
    fn decode(&mut self) -> I;
}

impl Decode for Machine {
    /// Get the current instruction from the code segment.
    fn opcode(&self) -> u16 {
        self.mem.get(self.reg.get(PC))
    }

    /// Get a single argument from the code segment.
    fn arg(&mut self) -> u16 {
        self.reg.inc(PC);
        self.opcode()
    }

    /// Returns the current instruction.
    /// Decodes the opcode and arguments into instruction.
    fn decode(&mut self) -> I {
        let i: I = self.opcode().into();

        // TODO: this is very repetitive!
        //       Can we detect the number of arguments and do this automatically?
        match i {
            I::Push(_) => I::Push(self.arg()),
            I::EndLoop(_) => I::EndLoop(self.arg()),
            I::Jump(_) => I::Jump(self.arg()),
            I::JumpZero(_) => I::JumpZero(self.arg()),
            I::JumpNotZero(_) => I::JumpNotZero(self.arg()),
            _ => i
        }
    }
}