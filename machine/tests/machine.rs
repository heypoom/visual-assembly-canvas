#[cfg(test)]
mod machine_tests {
    use machine::{Execute, Machine as M, Op};

    #[test]
    fn test_run_machine() {
        let mut m: M = vec![Op::Push(10), Op::Push(3), Op::Sub].into();
        m.run().expect("cannot run the test program");

        assert_eq!(m.stack().peek(), 7);
    }


    #[test]
    fn test_instruction_after_zero() {
        let mut m: M = r"
            push 1
            push 0
            push 2
        ".try_into().expect("cannot parse the test program");

        m.run().expect("cannot run the test program");
        assert_eq!(m.mem.read_stack(2), [1, 0, 2]);

        let mut m: M = r"
            push 0
            push 1
        ".try_into().expect("cannot parse the test program");

        m.run().expect("cannot run the test program");
        assert_eq!(m.mem.read_stack(2), [0, 1]);
    }
}
