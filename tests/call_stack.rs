#[cfg(test)]
mod call_stack_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Instruction as I};

    #[test]
    fn test_call_stack() {
        let mut m: Machine = vec![
            I::Call(6),
            I::Push(0xAA), // [pusher]
            I::Push(0xBB),
            I::Return,
            I::Call(1),    // [start]
            I::Call(1),
        ].into();

        m.run();
        assert_eq!(m.mem.read_stack(4), [0xAA, 0xBB, 0xAA, 0xBB]);
    }
}
