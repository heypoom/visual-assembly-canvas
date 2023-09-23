const MEMORY_SIZE: usize = 0xFFFF;

/**
 * Memory defines a fixed-size memory area for the program.
 */
#[derive(Debug)]
pub struct Memory {
    pub buffer: [u8; MEMORY_SIZE],
}

impl Memory {
    pub fn new() -> Memory {
        Memory {
            buffer: [0; MEMORY_SIZE],
        }
    }

    pub fn set(&mut self, addr: u16, val: u8) {
        self.buffer[addr as usize] = val;
    }

    pub fn get(&self, addr: u16) -> u8 {
        self.buffer[addr as usize]
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
}
