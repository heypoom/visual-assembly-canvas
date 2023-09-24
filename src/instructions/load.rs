use crate::instructions::Instruction;
use crate::instructions::Instruction::Push;
use crate::mem::Memory;

pub trait Load {
    fn load_code(&mut self, code: Vec<Instruction>);
}

pub const CODE_START: u16 = 0x0000;

impl Load for Memory {
    fn load_code(&mut self, code: Vec<Instruction>) {
        let mut offset = CODE_START;

        for ins in code {
            // Insert the opcode into memory.
            self.set(offset, ins.opcode());
            offset += 1;

            // Insert the operands into memory.
            match ins {
                Push(v) => {
                    self.set(offset, v);
                    offset += 1;
                }
                _ => {}
            }
        }
    }
}

type I = Instruction;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_code() {
        let mut m = Memory::new();
        m.load_code(vec![I::Push(5), I::Push(10), I::Add, I::Pop]);

        assert_eq!(&m.buffer[0..7], [0x01, 5, 0x01, 10, 0x03, 0x02, 0x00])
    }
}
