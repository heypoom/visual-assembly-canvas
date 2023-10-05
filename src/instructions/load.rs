use crate::CODE_START;
use crate::instructions::Instruction as I;
use crate::mem::Memory;

pub trait Load {
    fn load_code(&mut self, code: Vec<I>);
}

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
                I::LoadString(v) | I::Store(v) | I::Load(v) | I::JumpNotZero(v) | I::JumpZero(v) | I::Jump(v) | I::Push(v) => write(v),
                _ => {}
            }
        }

        write(I::Halt.opcode());
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_code() {
        let mut m = Memory::new();
        m.load_code(vec![I::Push(5), I::Push(10)]);
        assert_eq!(&m.buffer[0..4], [0x01, 5, 0x01, 10])
    }
}
