#[cfg(test)]
mod loop_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Instruction as I};

    #[test]
    fn test_loop() {
        let mut m: Machine = vec![
            I::Push(0),  // i = 0

            I::Push(2),  // [loop_start]
            I::Add,      // i += 2
            I::Dup,      // B = i
            I::Push(20), // A = 20

            I::GreaterThanOrEqual,      // 20 >= i?
            I::JumpNotZero(1), // jump to [loop_start] if 20 >= i

            // i is now over 20. we are at the end of the loop.
            I::Push(0xFF),
        ].into();

        m.run();

        assert_eq!(m.mem.read_stack(2), [22, 255]);
    }
}
