#[cfg(test)]
mod parser_tests {
    use opcodes_to_algorithms::{Parser, Machine, Execute, Instruction as I};

    const SOURCE: &'static str = r"
        jump start

        add_pattern:
            push 0xAA
            push 0b1011
            push 01024
            return

        start:
            call add_pattern
            halt
    ";

    #[test]
    fn test_parser() {
        let mut p = Parser::new(SOURCE);
        p.parse();

        println!("Symbols: {:?}", p.symbols.labels);
        println!("Ops: {:?}", p.instructions);

        // assert_eq!(*p.symbols.labels.get("start").unwrap(), 10);
        // assert_eq!(*p.symbols.labels.get("add_pattern").unwrap(), 2);

        let mut m: Machine = p.instructions.into();
        m.run();

        println!("{:?}", m.mem.read_stack(6));
    }
}
