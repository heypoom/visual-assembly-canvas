#[cfg(test)]
mod router_tests {
    use machine::{MessageNeverReceived};
    use machine::canvas::Canvas;
    use machine::canvas::error::CanvasError;
    use machine::canvas::error::CanvasError::MachineError;
    use machine::canvas::wire::port;
    use machine::status::MachineStatus::{Halted, Running};

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_send_and_receive() -> Errorable {
        let src_0 = r"
            push 6
            receive
            mul
        ";

        let src_1 = r"
            push 10
            push 20
            add
            send 0 1
        ";

        let mut r = Canvas::new();
        r.add_machine()?;
        r.add_machine()?;

        r.load_program(0, src_0)?;
        r.load_program(1, src_1)?;
        r.connect(port(1, 0), port(0, 0))?;
        r.run()?;

        assert_eq!(r.router.get_mut(0).expect("cannot get first machine").stack().peek(), 180);
        assert_eq!(r.router.statuses[&0], Halted, "machine must be halted after message is received");

        Ok(())
    }

    #[test]
    fn test_bare_receive() -> Errorable {
        let src_1 = r"
            push 10
            push 20
            add
            send 0 1
        ";

        let mut r = Canvas::new();
        r.add_machine()?;
        r.add_machine()?;
        r.connect(port(1, 0), port(0, 0))?;

        r.load_program(0, "receive")?;
        r.load_program(1, src_1)?;
        r.run()?;

        let m1 = r.router.get_mut(0).expect("cannot get first machine");
        assert_eq!(m1.stack().peek(), 30);
        assert_eq!(r.router.statuses[&0], Halted, "machine must be halted after message is received");

        Ok(())
    }

    #[test]
    fn test_bare_receive_inverted() -> Errorable {
        let src_0 = r"
            push 10
            push 20
            add
            send 0 1
        ";

        let mut r = Canvas::new();
        r.add_machine()?;
        r.add_machine()?;

        r.load_program(0, src_0)?;
        r.load_program(1, "receive")?;
        r.connect(port(0, 0), port(1, 0))?;

        assert_ne!(r.run(), Err(MachineError { cause: MessageNeverReceived { id: 1 } }), "machine 1 should receive the message");

        let m1 = r.router.get_mut(1).expect("cannot get second machine");
        assert_eq!(m1.stack().peek(), 30);
        assert_eq!(r.router.statuses[&1], Halted, "machine must be halted after message is received");

        Ok(())
    }

    #[test]
    fn test_stepping() -> Errorable {
        let src_1 = r"
            push 0xAA
            push 0xBB
            push 0xCC
        ";

        let mut r = Canvas::new();
        r.add_machine()?;

        r.load_program(0, src_1)?;
        r.router.ready();

        r.tick()?;
        r.tick()?;
        assert_eq!(r.router.statuses.get(&0), Some(&Running));

        r.tick()?;
        assert_eq!(r.router.statuses.get(&0), Some(&Halted));

        Ok(())
    }

    #[test]
    fn test_hanging_receive() -> Errorable {
        let mut r = Canvas::new();
        r.add_machine()?;
        r.add_machine()?;
        r.load_program(0, "receive")?;
        r.load_program(1, "push 5")?;

        assert_eq!(r.run(), Err(MachineError { cause: MessageNeverReceived { id: 0 } }));

        Ok(())
    }

    #[test]
    fn test_hanging_receive_single() -> Errorable {
        let mut r = Canvas::new();
        r.add_machine()?;
        r.load_program(0, "receive")?;
        assert_eq!(r.run(), Err(MachineError { cause: MessageNeverReceived { id: 0 } }));

        Ok(())
    }

    #[test]
    fn test_hanging_bidirectional() -> Errorable {
        let mut r = Canvas::new();
        r.add_machine()?;
        r.add_machine()?;

        r.load_program(0, "receive")?;
        r.load_program(1, "receive")?;
        assert_eq!(r.run(), Err(MachineError { cause: MessageNeverReceived { id: 1 } }));

        Ok(())
    }
}
