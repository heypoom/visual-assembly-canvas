#[cfg(test)]
mod instruction_enum_tests {
    use poom_macros::{InsertArgs, Arity};

    #[derive(Debug, PartialEq, InsertArgs, Arity)]
    enum Foo {
        Pop,
        Push(u16),
        Foo(u16, u16, u16),
    }

    #[test]
    fn test_with_arg() {
        assert_eq!(Foo::Pop.with_arg(|| 12), Foo::Pop);
        assert_eq!(Foo::Push(0).with_arg(|| 24), Foo::Push(24));
        assert_eq!(Foo::Foo(0, 0, 0).with_arg(|| 6), Foo::Foo(6, 6, 6));
    }

    #[test]
    fn test_arity() {
        assert_eq!(Foo::Pop.arity(), 0);
        assert_eq!(Foo::Push(1).arity(), 1);
        assert_eq!(Foo::Foo(0, 0, 0).arity(), 3);
    }
}
