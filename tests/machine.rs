#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine as M, Execute, Op};

    #[test]
    fn test_run_machine() {
        let mut m: M = vec![Op::Push(10), Op::Push(3), Op::Sub].into();
        m.run();

        assert_eq!(m.stack().peek(), 7);
    }
}
