#[cfg(test)]
mod arity_tests {
    use poom_macros::Arity;

    #[derive(Arity)]
    enum Foo {
        Bar(u16, u16),
        Baz(String),
    }

    #[test]
    fn test_arity() {
        let m = Foo::Bar(1, 2);
        println!("{}", m.arity());
        // println!("{}", m.bar());
    }
}
