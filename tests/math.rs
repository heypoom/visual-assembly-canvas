#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine as M, Execute, Instruction as I};

    #[test]
    fn test_add() {
        let mut m: M = vec![I::Push(5), I::Push(10), I::Add, I::Push(3), I::Sub].into();

        m.tick();
        m.tick();
        assert_eq!(m.mem.read_stack(2), [5, 10]);

        m.tick();
        assert_eq!(m.stack().peek(), 15);

        m.tick();
        assert_eq!(m.stack().peek(), 3);

        m.tick();
        assert_eq!(m.stack().peek(), 12);
    }
}
