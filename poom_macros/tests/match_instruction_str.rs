#[cfg(test)]
mod match_instruction_str_tests {
    use poom_macros::NameToInstruction;

    #[derive(Debug, PartialEq, NameToInstruction)]
    enum Foo {
        Push(u16),
        Pop,
        LoadString(u16),
    }


    #[test]
    fn test_instruction() {
        assert_eq!(Foo::from_name("pop", || 12), Foo::Pop);
        assert_eq!(Foo::from_name("push", || 12), Foo::Push(12));
        assert_eq!(Foo::from_name("load_string", || 0xFF), Foo::LoadString(0xFF));
    }
}
