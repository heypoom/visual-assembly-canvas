#[cfg(test)]
mod tests {
    extern crate machine as O;

    use O::{Execute, Machine as M, Op};

    #[test]
    fn test_eq() {
        let mut m: M = vec![Op::Push(10), Op::Push(10), Op::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![Op::Push(5), Op::Push(2), Op::Equal].into();
        m.run();
        assert_eq!(m.stack().peek(), 0);
    }

    #[test]
    fn test_le_ge() {
        let mut m: M = vec![Op::Push(5), Op::Push(2), Op::LessThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);

        let mut m: M = vec![Op::Push(2), Op::Push(5), Op::GreaterThan].into();
        m.run();
        assert_eq!(m.stack().peek(), 1);
    }
}
