#[cfg(test)]
mod call_stack_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Load, Instruction as I};

    #[test]
    fn test_call_stack() {
        let mut m = Machine::new();

        let ptr_pusher = 1;
        let ptr_start = 6;

        m.mem.load_code(vec![
            I::Call(ptr_start),

            // [pusher]
            I::Push(0xAA),
            I::Push(0xBB),
            I::Return,

            // [start]
            I::Call(ptr_pusher),
            I::Call(ptr_pusher),
        ]);

        m.run();
        assert_eq!(m.mem.read_stack(4), [0xAA, 0xBB, 0xAA, 0xBB]);
    }
}
