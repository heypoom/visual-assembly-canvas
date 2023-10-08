#[cfg(test)]
mod tests {
    use machine::{Execute, Machine as M, Op};

    #[test]
    fn test_run_machine() {
        let mut m: M = vec![Op::Push(10), Op::Push(3), Op::Sub].into();
        m.run();

        assert_eq!(m.stack().peek(), 7);
    }
}
