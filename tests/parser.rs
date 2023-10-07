pub mod code_samples;

#[cfg(test)]
mod parser_tests {
    use opcodes_to_algorithms::{Parser, Instruction as I};
    use super::code_samples::SAMPLE_1;

    #[test]
    fn test_parse_sample_one() {
        let mut p: Parser = SAMPLE_1.into();
        p.parse();

        assert_eq!(p.symbols.labels["start"], 9);
        assert_eq!(p.symbols.labels["add_pattern"], 2);

        assert_eq!(p.instructions[0], I::Jump(9));
        assert_eq!(p.instructions[5], I::Call(2));
    }
}
