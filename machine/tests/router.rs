#[cfg(test)]
mod router_tests {
    use machine::{Router, RouterError};

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

        assert_eq!(r.get_mut(1).unwrap().stack().peek(), 180);

        Ok(())
    }
}
