#[cfg(test)]
mod tests {
    use machine::{Execute, Machine as M, Op, RuntimeError};

    #[test]
    fn test_add() -> Result<(), RuntimeError> {
        let mut m: M = vec![Op::Push(5), Op::Push(10), Op::Add, Op::Push(3), Op::Sub].into();

        m.tick()?;
        m.tick()?;
        assert_eq!(m.mem.read_stack(2), [5, 10]);

        m.tick()?;
        assert_eq!(m.stack().peek(), 15);

        m.tick()?;
        assert_eq!(m.stack().peek(), 3);

        m.tick()?;

        // Ensure the top of the stack does not contain invalid values.
        assert_eq!(m.mem.read_stack(2), [12, 0]);

        Ok(())
    }
}
