#[cfg(test)]
mod router_tests {
    use machine::{Router, RouterError};
    use machine::status::MachineStatus::{Halted, Running};

    #[test]
    fn test_send_and_receive() -> Result<(), RouterError> {
        let src_1 = r"
            push 10
            push 20
            add
            send 1 1
        ";

        let src_2 = r"
            push 6
            receive
            mul
        ";

        let mut r = Router::new();
        r.add();
        r.add();

        r.load(0, src_1)?;
        r.load(1, src_2)?;
        r.run()?;

        assert_eq!(r.get_mut(1).expect("cannot get second machine").stack().peek(), 180);

        Ok(())
    }

    #[test]
    fn test_stepping() -> Result<(), RouterError> {
        let src_1 = r"
            push 0xAA
            push 0xBB
            push 0xCC
        ";

        let mut r = Router::new();
        r.add();

        r.load(0, src_1)?;
        r.ready();

        r.step()?;
        r.step()?;
        assert_eq!(r.statuses.get(&0), Some(&Running));

        r.step()?;
        assert_eq!(r.statuses.get(&0), Some(&Halted));

        Ok(())
    }
}
