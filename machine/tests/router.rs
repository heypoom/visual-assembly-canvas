#[cfg(test)]
mod router_tests {
    use machine::Router;

    #[test]
    fn test_send_and_receive() {
        let src_1 = r"
            push 1
            push 2
            add
            send 1 1
        ";

        let src_2 = r"
            push 3
            receive
        ";

        let mut r = Router::new();
        let m1_id = r.add();
        let m2_id = r.add();

        r.load(m1_id, src_1);
        r.load(m2_id, src_2);

        r.ready();
        r.step();
    }
}
