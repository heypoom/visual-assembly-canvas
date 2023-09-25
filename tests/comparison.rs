#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine as M, Execute, Instruction as I};

    #[test]
    fn test_eq() {
        let mut m: M = vec![I::Push(10), I::Push(10), I::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![I::Push(5), I::Push(2), I::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 0);
    }

    #[test]
    fn test_le_ge() {
        let mut m: M = vec![I::Push(5), I::Push(2), I::LessThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![I::Push(2), I::Push(5), I::GreaterThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);
    }
}
