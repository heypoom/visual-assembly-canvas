pub mod asm;

#[cfg(test)]
mod call_stack_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Op};
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
            Op::Call(9),
            Op::Push(0xAA), // [pusher]
            Op::Push(0b11001100),
            Op::Push(01024),
            Op::Return,
            Op::Call(2),    // [start]
            Op::Call(2),
        ].into();

        m.run();
        assert_eq!(m.mem.read_stack(6), [0xAA, 0b11001100, 1024, 0xAA, 0b11001100, 1024]);
    }
}
