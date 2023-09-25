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

            // TODO: this is very repetitive!
            //       Can we detect the number of arguments and do this automatically?
            match ins {
                I::Push(v) => write(v),
                I::EndLoop(v) => write(v),
                I::Jump(v) => write(v),
                I::JumpZero(v) => write(v),
                I::JumpNotZero(v) => write(v),
                I::Load(v) => write(v),
                I::Store(v) => write(v),
                I::LoadString(v) => write(v),

                _ => {}
            }
        }

        write(I::Halt.opcode());
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    type I = Instruction;

    #[test]
    fn test_load_code() {
        let mut m = Memory::new();
        m.load_code(vec![I::Push(5), I::Push(10)]);
        assert_eq!(&m.buffer[0..4], [0x01, 5, 0x01, 10])
    }
}
