use super::Memory;

pub trait Allocator {
    /// Returns the starting offset to the allocated memory.
    fn alloc(&mut self, size: usize) -> usize;
}

impl Allocator for Memory {
    /// Returns an offset to the allocated memory.
    fn alloc(&mut self, size: usize) -> usize {
        // Reserve the memory.
        let p = self.cursor.clone();
        self.cursor += size as usize;

        return p;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_alloc() {
        let mut m = Memory::new();

        let a = m.alloc(5);
        m.set(a, 1);
        m.set(a + 1, 2);
        m.set(a + 4, 3);

        let b = m.alloc(5);
        m.set(b, 4);
        m.set(b + 1, 5);

        assert_eq!(a, 0);
        assert_eq!(b, 5);

        assert_eq!(&m.buffer[0..8], [1, 2, 0, 0, 3, 4, 5, 0]);

        println!("{:?}", &m.buffer[0..8]);
    }
}
