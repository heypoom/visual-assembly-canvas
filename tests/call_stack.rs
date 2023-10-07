pub mod code_samples;

#[cfg(test)]
mod call_stack_tests {
    extern crate opcodes_to_algorithms as O;

    use super::code_samples::CODE_SAMPLE_CALL_STACK;
    use O::{Machine, Execute, Instruction as I};

    #[test]
    fn test_call_stack_asm() {
        let mut m: Machine = CODE_SAMPLE_CALL_STACK.into();
        m.run();
        assert_eq!(m.mem.read_stack(6), [0xAA, 0b11001100, 1024, 0xAA, 0b11001100, 1024]);
    }

    #[test]
    fn test_call_stack_instructions() {
        let mut m: Machine = vec![
            I::Call(7),
            I::Push(0xAA), // [pusher]
            I::Push(0xBB),
            I::Return,
            I::Call(2),    // [start]
            I::Call(2),
        ].into();

        m.run();
        assert_eq!(m.mem.read_stack(4), [0xAA, 0xBB, 0xAA, 0xBB]);
    }
}
