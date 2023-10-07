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
    fn decode(&mut self) -> I {
        let opcode = self.opcode();
        let op: I = opcode.into();

        // Inject the arguments into the instruction.
        // TODO: this is very repetitive!
        //       Can we detect the number of arguments and do this automatically?
        let op = match op {
            I::Push(_) => I::Push(self.arg()),
            I::Jump(_) => I::Jump(self.arg()),
            I::JumpZero(_) => I::JumpZero(self.arg()),
            I::JumpNotZero(_) => I::JumpNotZero(self.arg()),
            I::Load(_) => I::Load(self.arg()),
            I::Store(_) => I::Store(self.arg()),
            I::LoadString(_) => I::LoadString(self.arg()),
            I::Call(_) => I::Call(self.arg()),
            _ => op
        };

        if self.is_debug {
            let pc = self.reg.get(PC);
            let raw = self.mem.read(pc, (op.arity() + 1) as u16);
            println!("{:02} | {:?} | {} | {:?}", pc, op, opcode, raw);
        }

        op
    }
}