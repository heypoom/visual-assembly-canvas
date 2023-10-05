#[cfg(test)]
mod parser_tests {
    use opcodes_to_algorithms::Parser;

    const SOURCE: &'static str = r"
        jump start

        add_pattern:
            push 0xAA
            push 0b1011
            push 01024
            return

        start:
            call add_pattern
            call add_pattern
    ";

    #[test]
    fn test_parser() {
        let mut p = Parser::new(SOURCE);
        p.parse();

        println!("{:?}", p.instructions);
        println!("{:?}", p.symbols);
    }
}
