type M = [u8; 0xFF];

#[derive(Debug)]
struct CPU {
    mem: M,
    alloc_cursor: usize,
}

impl CPU {
    fn new() -> CPU {
        CPU {
            mem: [0; 0xFF],
            alloc_cursor: 0,
        }
    }

    /// Returns an offset to the allocated memory.
    fn alloc(&mut self, size: usize) -> usize {
        // Reserve the memory.
        let p = self.alloc_cursor.clone();
        self.alloc_cursor += size as usize;

        return p;
    }
}

trait Memory {
    fn set(&mut self, addr: usize, val: u8);
    fn get(&self, addr: usize) -> u8;
}

impl Memory for M {
    fn set(&mut self, addr: usize, val: u8) {
        self[addr] = val;
    }

    fn get(&self, addr: usize) -> u8 {
        self[addr]
    }
}

fn main() {
    let cpu = CPU::new();
    println!("{}", cpu.mem.get(0));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memset() {
        let mut cpu = CPU::new();

        cpu.mem.set(0, 1);
        assert_eq!(cpu.mem.get(0), 1);
        assert_eq!(cpu.mem.get(1), 0);
    }

    #[test]
    fn test_malloc() {
        let mut cpu = CPU::new();
        let mut m = cpu.mem;

        let a = cpu.alloc(5);
        m.set(a, 1);
        m.set(a + 1, 2);
        m.set(a + 4, 3);

        let b = cpu.alloc(5);
        m.set(b, 4);
        m.set(b + 1, 5);

        assert_eq!(a, 0);
        assert_eq!(b, 5);

        assert_eq!(&m[0..8], [1, 2, 0, 0, 3, 4, 5, 0]);

        println!("{:?}", &m[0..8]);
    }
}
