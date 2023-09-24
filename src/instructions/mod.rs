pub mod load;

use bimap::BiMap;
use lazy_static::lazy_static;
pub use load::Load;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;
use crate::register::Register;

pub enum Target {
    Register(Register),
    Memory(u16),
}

pub enum Value {
    Data(u16),
    Register(Register),
    Memory(u16),
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, EnumIter, Hash)]
pub enum Instruction {
    None,

    Push(u16),
    Pop,

    /// MOV: Destination Memory, Value
    Mov(Target, Value),

    Inc,
    Dec,

    Add,
    Sub,
    Mul,
    Div,

    StartLoop,
    EndLoop(u16),

    /// Jump to the address.
    Jump(u16),

    /// Jump to the address if the previous value in the stack is zero.
    JumpZero(u16),

    /// Jump to the address if the previous value in the stack is not zero.
    JumpNotZero(u16),

    Halt,
}

lazy_static! {
    static ref OPCODES: BiMap<Instruction, u16> = {
        let mut m = BiMap::new();

        for (i, op) in Instruction::iter().enumerate() {
            m.insert(op, i as u16);
        }

        return m;
    };
}

type I = Instruction;

impl From<u16> for Instruction {
    fn from(id: u16) -> Self {
        *OPCODES.get_by_right(&id).unwrap_or(&I::None)
    }
}

impl From<Instruction> for u16 {
    fn from(ins: Instruction) -> Self {
        let v = match ins {
            I::Push(_) => I::Push(0),
            _ => ins,
        };

        *OPCODES.get_by_left(&v).unwrap_or(&0)
    }
}

impl Instruction {
    pub fn opcode(self) -> u16 {
        self.into()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_opcode() {
        // Convert instruction to opcode.
        assert_eq!(I::Push(12).opcode(), 0x01);

        // Convert opcode to instruction.
        assert_eq!(I::from(2), I::Pop);

        // Convert opcode to instruction.
        assert_eq!(I::from(I::Pop.opcode()), I::Pop);

        // Convert instruction to opcode and back.
        assert_eq!(I::from(I::Push(12).opcode()), I::Push(0));
    }
}
