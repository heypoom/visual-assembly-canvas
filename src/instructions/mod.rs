pub mod load;

pub use load::Load;
pub use bimap::BiMap;
use lazy_static::lazy_static;

use strum::IntoEnumIterator;
use strum_macros::{EnumIter, FromRepr};

#[derive(Debug, Copy, Clone, Eq, PartialEq, EnumIter, Hash, FromRepr)]
pub enum Instruction {
    None,

    Push(u8),
    Pop,

    Add,
    Sub,
    Mul,
    Div,

    Halt
}

lazy_static! {
    static ref OPCODES: BiMap<Instruction, u8> = {
        let mut m = BiMap::new();

        for (i, op) in Instruction::iter().enumerate() {
            m.insert(op, i as u8);
        }

        return m
    };
}

type I = Instruction;

impl From<u8> for Instruction {
    fn from(id: u8) -> Self {
        Instruction::from_repr(id as usize).unwrap_or(I::None)
    }
}

impl From<Instruction> for u8 {
    fn from(ins: Instruction) -> Self {
        let v = match ins {
            I::Push(_) => I::Push(0),
            _ => ins
        };

        *OPCODES.get_by_left(&v).unwrap_or(&0)
    }
}

impl Instruction {
    pub fn opcode(self) -> u8 {
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