#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine as M, Execute, Instruction as I};

    #[test]
    fn test_run_machine() {
        let mut m: M = vec![I::Push(10), I::Push(3), I::Sub].into();
        m.run();

        assert_eq!(m.stack().peek(), 7);
    }
}
