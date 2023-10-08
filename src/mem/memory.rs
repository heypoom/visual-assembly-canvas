use crate::{compile_to_bytecode, Symbols, Op, CALL_STACK_START, CODE_START, MEMORY_SIZE, STACK_START, DATA_START};

/**
 * Memory defines a fixed-size memory area for the program.
 */
#[derive(Debug)]
pub struct Memory {
    pub buffer: [u16; MEMORY_SIZE as usize],
}

impl Memory {
    pub fn new() -> Memory {
        Memory {
            buffer: [0; MEMORY_SIZE as usize],
        }
    }

    pub fn set(&mut self, addr: u16, val: u16) {
        self.buffer[addr as usize] = val;
    }

    pub fn get(&self, addr: u16) -> u16 {
        self.buffer[addr as usize]
    }

    pub fn read(&self, addr: u16, count: u16) -> Vec<u16> {
        let start = addr as usize;

        self.buffer[start..(start + count as usize)].into()
    }

    pub fn write(&mut self, addr: u16, data: &[u16]) {
        for (offset, value) in data.iter().enumerate() {
            self.buffer[addr as usize + offset] = *value;
        }
    }

    pub fn read_code(&self, count: u16) -> Vec<u16> {
        self.read(CODE_START, count)
    }

    pub fn read_stack(&self, count: u16) -> Vec<u16> {
        self.read(STACK_START, count)
    }

    pub fn read_call_stack(&self, count: u16) -> Vec<u16> {
        self.read(CALL_STACK_START, count)
    }

    pub fn load_code(&mut self, ops: Vec<Op>) {
        self.write(CODE_START, &compile_to_bytecode(ops))
    }

    pub fn load_symbols(&mut self, symbols: Symbols) {
        self.write(DATA_START, &symbols.bytes());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memset() {
        let mut m = Memory::new();

        m.set(0, 1);
        assert_eq!(m.get(0), 1);
        assert_eq!(m.get(1), 0);
    }

    #[test]
    fn test_write() {
        let mut m = Memory::new();

        m.write(0x03, &[1, 2, 3]);
        assert_eq!(m.read(0x03, 3), [1, 2, 3]);
    }

    #[test]
    fn test_load_code() {
        let mut m = Memory::new();
        m.load_code(vec![Op::Push(5), Op::Push(10)]);
        assert_eq!(&m.buffer[0..4], [0x01, 5, 0x01, 10])
    }
}
