#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine as M, Execute, Op};

    #[test]
    fn test_add() {
        let mut m: M = vec![Op::Push(5), Op::Push(10), Op::Add, Op::Push(3), Op::Sub].into();

        m.tick();
        m.tick();
        assert_eq!(m.mem.read_stack(2), [5, 10]);

        m.tick();
        assert_eq!(m.stack().peek(), 15);

        m.tick();
        assert_eq!(m.stack().peek(), 3);

        m.tick();

        // Ensure the top of the stack does not contain invalid values.
        assert_eq!(m.mem.read_stack(2), [12, 0]);
    }
}
