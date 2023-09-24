pub mod load;

pub use load::Load;
pub use bimap::BiMap;
use lazy_static::lazy_static;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;

#[derive(Debug, Copy, Clone, Eq, PartialEq, EnumIter, Hash)]
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

impl Instruction {
    pub fn id(id: u8) -> Instruction {
        *OPCODES.get_by_right(&id).unwrap_or(&Instruction::None)
    }

    pub fn opcode(self) -> u8 {
        let v = match self {
            I::Push(_) => I::Push(0),
            _ => self
        };

        *OPCODES.get_by_left(&v).unwrap_or(&0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_opcode() {
        let v = I::Push(15);
        println!("{:?} {:?}", v, v.opcode());

        // assert_eq!(I::Push(0).opcode(), 0x01);
        // assert_eq!(I::Sub.opcode(), 0x04);
    }
}