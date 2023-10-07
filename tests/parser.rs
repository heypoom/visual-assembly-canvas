#[cfg(test)]
mod parser_tests {
    use opcodes_to_algorithms::{Parser, Op, load_test_file};

    #[test]
    fn test_parse_sample_one() {
        let mut p: Parser = (*load_test_file("call-stack-1.asm")).into();
        p.parse();

        assert_eq!(p.symbols.labels["start"], 9);
        assert_eq!(p.symbols.labels["add_pattern"], 2);

        assert_eq!(p.ops[0], Op::Jump(9));
        assert_eq!(p.ops[5], Op::Call(2));
    }
}
