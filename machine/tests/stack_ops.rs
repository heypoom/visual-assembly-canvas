#[cfg(test)]
mod stack_operation_tests {
    use machine::{Execute, Machine, Op};

    #[test]
    fn test_stack_ops() {
        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Nip].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(3), [1, 3, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Tuck].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(5), [1, 3, 2, 3, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Rotate].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(4), [2, 1, 3, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Over].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(5), [1, 2, 3, 2, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Pick(2)].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(5), [1, 2, 3, 3, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Swap].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(4), [1, 3, 2, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Pop].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(3), [1, 2, 0]);

        let mut m: Machine = vec![Op::Push(1), Op::Push(2), Op::Push(3), Op::Dup].into();
        m.run().unwrap();
        assert_eq!(m.mem.read_stack(5), [1, 2, 3, 3, 0]);
    }
}