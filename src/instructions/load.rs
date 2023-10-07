use crate::{CODE_START, compile};
use crate::instructions::Instruction as I;
use crate::mem::Memory;

pub trait Load {
    fn load_code(&mut self, ops: Vec<I>);
}

impl Load for Memory {
    fn load_code(&mut self, ops: Vec<I>) {
        self.write(CODE_START, &compile(ops))
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
