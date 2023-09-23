mod alloc;

#[derive(Debug)]
pub struct Memory {
    pub buffer: [u8; 0xFF],
    pub cursor: usize,
}

impl Memory {
    pub fn new() -> Memory {
        Memory {
            buffer: [0; 0xFF],
            cursor: 0,
        }
    }

    pub fn set(&mut self, addr: usize, val: u8) {
        self.buffer[addr] = val;
    }

    pub fn get(&self, addr: usize) -> u8 {
        self.buffer[addr]
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
