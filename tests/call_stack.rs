pub mod asm;

#[cfg(test)]
mod call_stack_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Op as I};
    use crate::asm::load_test_program;

    #[test]
    fn test_call_stack_asm() {
        let mut m: Machine = load_test_program("call-stack-1.asm");
        m.run();
        assert_eq!(m.mem.read_stack(6), [0xAA, 0b11001100, 1024, 0xAA, 0b11001100, 1024]);
    }

    #[test]
    fn test_call_stack_instructions() {
        let mut m: Machine = vec![
            I::Call(9),
            I::Push(0xAA), // [pusher]
            I::Push(0b11001100),
            I::Push(01024),
            I::Return,
            I::Call(2),    // [start]
            I::Call(2),
        ].into();

        m.run();
        assert_eq!(m.mem.read_stack(6), [0xAA, 0b11001100, 1024, 0xAA, 0b11001100, 1024]);
    }
}
