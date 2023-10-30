#[cfg(test)]
mod parser_tests {
    use machine::{load_test_file, Op, Parser};
    use machine::ParseError::{InvalidArgument, InvalidIdentifier};

    #[test]
    fn test_parse_call_stack() {
        let p: Result<Parser, _> = (*load_test_file("call-stack-1.asm")).try_into();
        let p = p.expect("cannot parse the tests file");

        assert_eq!(p.symbols.offsets["start"], 9);
        assert_eq!(p.symbols.offsets["add_pattern"], 2);

        assert_eq!(p.ops[0], Op::Jump(9));
        assert_eq!(p.ops[5], Op::Call(2));
    }

    #[test]
    fn test_parse_strings() {
        let p: Result<Parser, _> = (*load_test_file("hello-world.asm")).try_into();
        let p = p.expect("cannot parse the tests file");

        assert_eq!(p.symbols.strings["hello_world"], "Hello, world!");
        assert_eq!(p.symbols.offsets["hello_world"], 0);

        assert_eq!(p.symbols.strings["foo"], "foo bar");
        assert_eq!(p.symbols.offsets["foo"], 14);

        assert_eq!(p.symbols.data["bar"][0], 0xDEAD);
        assert_eq!(p.symbols.data["baz"][0], 0xBEEF);
    }

    #[test]
    fn test_parse_zero() {
        let mut p = Parser::new("push 0");
        p.parse().expect("cannot parse the source");
        assert_eq!(p.ops, [Op::Push(0)])
    }

    #[test]
    fn test_skip_eol() {
        let source = r"push 0




        ";

        let mut p = Parser::new(source);
        p.parse().expect("cannot parse the source with empty lines");
        assert_eq!(p.ops, [Op::Push(0)])
    }

    #[test]
    fn test_undefined_value() {
        let mut p = Parser::new("push ham_cheese");
        assert_eq!(p.parse(), Err(InvalidArgument { errors: vec![InvalidIdentifier] }));
    }
}
