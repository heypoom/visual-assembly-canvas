pub mod load;

pub use load::Load;

#[derive(Copy, Clone)]
pub enum Instruction {
    Push(u8),
    Pop,

    Add,
    Sub,
    Mul,
    Div,

    Halt,
}

type I = Instruction;

impl Instruction {
    pub fn opcode(self) -> u8 {
        match self {
            I::Push(_) => 0x01,
            I::Pop => 0x02,
            I::Add => 0x03,
            I::Sub => 0x04,
            I::Mul => 0x05,
            I::Div => 0x06,
            I::Halt => 0x07
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_opcode() {
        assert_eq!(I::Push(16).opcode(), 0x01);
        assert_eq!(I::Sub.opcode(), 0x04);
    }
}