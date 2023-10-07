#[cfg(test)]
mod parser_tests {
    use opcodes_to_algorithms::{Parser, Machine, Execute};

    #[test]
    fn test_parser() {
        let src = r"
            jump start

            add_pattern:
                push 0xAA        ; 170
                push 0b11001100  ; 204
                push 01024       ; 1024
                return

            start:
                call add_pattern
                call add_pattern
                halt
        ";

        let mut p = Parser::new(src);
        p.parse();

        let mut m: Machine = p.instructions.into();
        m.run();

        assert_eq!(m.mem.read_stack(8), [0, 170, 204, 1024, 204, 170, 204, 1024]);
    }
}
