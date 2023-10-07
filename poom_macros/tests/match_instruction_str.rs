#[cfg(test)]
mod match_instruction_str_tests {
    use poom_macros::{NameToInstruction, InsertArgs};

    #[derive(Debug, PartialEq, NameToInstruction, InsertArgs)]
    enum Foo {
        Push(u16),
        Pop,
        LoadString(u16),
        Foo(u16, u16, u16),
    }

    #[test]
    fn test_name_to_instruction() {
        assert_eq!(Foo::from_name("pop", || 12), Foo::Pop);
        assert_eq!(Foo::from_name("push", || 12), Foo::Push(12));
        assert_eq!(Foo::from_name("load_string", || 0xFF), Foo::LoadString(0xFF));
        assert_eq!(Foo::from_name("foo", || 2), Foo::Foo(2, 2, 2));
    }

    #[test]
    fn test_insert_arg() {
        assert_eq!(Foo::Pop.insert_arg(|| 12), Foo::Pop);
        assert_eq!(Foo::Push(0).insert_arg(|| 24), Foo::Push(24));
        assert_eq!(Foo::Foo(0, 0, 0).insert_arg(|| 6), Foo::Foo(6, 6, 6));
    }
}
