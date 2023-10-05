#[cfg(test)]
mod scanner_tests {
    use opcodes_to_algorithms::Scanner;

    #[test]
    fn test_parser() {
        let source = r"
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

        let mut scanner = Scanner::new(source);
        scanner.scan_tokens();

        for token in scanner.tokens {
            println!("{:?} -> {}", token.token_type, token.lexeme);
        }
    }
}
