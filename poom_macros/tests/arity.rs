#[cfg(test)]
mod arity_tests {
    use poom_macros::Arity;

    #[derive(Arity)]
    enum Foo {
        Bar(u16, u16),
        Baz(bool),
        Quux(u16, bool, u16),
    }

    #[test]
    fn test_arity() {
        assert_eq!(Foo::Bar(1, 2).arity(), 2);
        assert_eq!(Foo::Baz(false).arity(), 1);
        assert_eq!(Foo::Quux(1, false, 3).arity(), 3);
    }
}
