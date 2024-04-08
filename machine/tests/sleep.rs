mod sleep_tests {
    use machine::{Machine, Op, Execute, Event};
    use machine::event::SleepDuration;

    #[test]
    fn test_sleep_event() {
        let mut m: Machine = vec![
            Op::Push(0xFF),
            Op::Sleep(10),
            Op::Push(0xAB),
            Op::SleepMs(200),
        ]
            .into();

        m.run().expect("cannot run the test program");

        assert_eq!(m.mem.read_stack(2), [0xFF, 0xAB]);
        assert_eq!(m.events[0], Event::Sleep {duration: SleepDuration::Tick(10)});
        assert_eq!(m.events[1], Event::Sleep {duration: SleepDuration::Ms(200)});
    }
}