use crate::instructions::Instruction;
use crate::instructions::Instruction as I;
use crate::mem::Memory;

pub trait Load {
    fn load_code(&mut self, code: Vec<I>);
}

pub const CODE_START: u16 = 0x0000;

impl Load for Memory {
    fn load_code(&mut self, code: Vec<I>) {
        let mut offset = CODE_START;

        let mut write = |v: u16| {
            self.set(offset, v.clone());
            offset += 1;
        };

        for ins in code {
            // Insert the opcode into memory.
            write(ins.opcode());

            // TODO: can we introspect the instruction to see how many operands it has?
            // Insert the operands into memory.
            match ins {
                I::Push(v) => write(v),
                I::EndLoop(v) => write(v),
                I::Jump(v) => write(v),
                I::JumpZero(v) => write(v),
                I::JumpNotZero(v) => write(v),

                _ => {}
            }
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    type I = Instruction;

    #[test]
    fn test_load_code() {
        let mut m = Memory::new();
        m.load_code(vec![I::Push(5), I::Push(10), I::Add, I::Pop]);
        assert_eq!(&m.buffer[0..7], [0x01, 5, 0x01, 10, 0x08, 0x02, 0x00])
    }
}
