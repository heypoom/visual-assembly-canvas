extern crate poom_macros;

pub mod load;
pub mod compile;

pub use load::Load;
pub use compile::*;

use bimap::BiMap;
use lazy_static::lazy_static;
use poom_macros::Arity;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;

#[derive(Debug, Copy, Clone, Eq, PartialEq, EnumIter, Hash, Arity)]
pub enum Instruction {
    Noop,

    Push(u16),
    Pop,

    /// Push the null-terminated string from the specified address onto the stack.
    LoadString(u16),

    /// Push data from the specified address onto the stack.
    Load(u16),

    /// Pop data from the stack and store it into the specified address.
    Store(u16),

    /// Duplicates the value at the top of the stack.
    /// Makes a copy of the top value and pushes it onto the stack.
    Dup,

    /// Swaps the positions of the top two values on the stack.
    Swap,

    /// Duplicates the second value from the top of the stack and pushes it onto the stack.
    Over,

    Inc,
    Dec,

    Add,
    Sub,
    Mul,
    Div,

    /// Jump to the address.
    Jump(u16),

    /// Jump to the address if the previous value in the stack is zero.
    JumpZero(u16),

    /// Jump to the address if the previous value in the stack is not zero.
    JumpNotZero(u16),

    Equal,
    NotEqual,
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual,

    // Print the text at the memory address of operand.
    Print,

    // Stores the PC on the call stack and jumps to the address.
    Call(u16),

    // Pop the return address from the call stack and jumps to it.
    Return,

    // Halt the program.
    Halt,

    // End-of-file marker.
    EOF,
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
        *OPCODES.get_by_right(&id).unwrap_or(&I::Noop)
    }
}

impl From<Instruction> for u16 {
    // TODO: this is very repetitive!
    fn from(ins: Instruction) -> Self {
        let v = match ins {
            I::Push(_) => I::Push(0),
            I::Jump(_) => I::Jump(0),
            I::JumpZero(_) => I::JumpZero(0),
            I::JumpNotZero(_) => I::JumpNotZero(0),
            I::Load(_) => I::Load(0),
            I::Store(_) => I::Store(0),
            I::LoadString(_) => I::LoadString(0),
            I::Call(_) => I::Call(0),
            _ => ins,
        };

        *OPCODES.get_by_left(&v).unwrap_or(&0)
    }
}

impl Instruction {
    pub fn opcode(self) -> u16 {
        self.into()
    }

    pub fn partial_eq(self, target: &I) -> bool {
        match (self, *target) {
            (I::Push(_), I::Push(_)) => true,
            _ => false
        }
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

    #[test]
    fn test_partial_eq() {
        assert!(I::Push(12).partial_eq(&I::Push(24)));
        assert_eq!(I::Push(12).partial_eq(&I::Pop), false);
    }

    #[test]
    fn test_arity() {
        assert_eq!(I::Noop.arity(), 0);
        assert_eq!(I::Push(12).arity(), 1);
        assert_eq!(I::Call(0xFF).arity(), 1);
    }
}
