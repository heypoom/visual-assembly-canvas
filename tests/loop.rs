#[cfg(test)]
mod loop_tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Load, Instruction as I};

    #[test]
    fn test_loop() {
        let mut m = Machine::new();

        let loop_start = 1;

        m.mem.load_code(vec![
            I::Push(0),  // i = 0

            // [loop_start]
            I::Push(2),
            I::Add,      // i += 2
            I::Dup,      // B = i
            I::Push(20), // A = 20

            // [A = 20, B = i; A < B; ? 1 : 0]
            I::LessThan,
            I::JumpZero(loop_start), // 20 , jump to loop_start
            I::Push(0xFF),
        ]);

        m.run();

        assert_eq!(m.mem.read_stack(2), [22, 255]);
    }
}
