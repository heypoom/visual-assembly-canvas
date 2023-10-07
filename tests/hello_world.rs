#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use mockall::{automock, predicate::*};
    use O::{Machine, Execute, Op, WithStringManager, load_test_program};

    #[cfg_attr(test, automock)]
    trait Printer {
        fn print(&self, s: &str);
    }

    #[test]
    fn test_print_hello_world() {
        let mut mock = MockPrinter::new();
        mock.expect_print().with(eq("hello, ")).times(1).return_const(());
        mock.expect_print().with(eq("world!")).times(1).return_const(());

        let print = move |s: &_| mock.print(s);

        let mut m = Machine::new();
        m.handlers.print.push(Box::new(print));

        let mut strings = m.mem.string();
        let hello_ptr = strings.add_str("hello, ");
        let world_ptr = strings.add_str("world!");

        m.mem.load_code(vec![Op::LoadString(hello_ptr), Op::Print, Op::LoadString(world_ptr), Op::Print]);
        m.run();

        assert_eq!(m.mem.read_stack(1), [0], "stack should be empty");
    }

    #[test]
    fn test_print_hello_world_asm() {
        let mut mock = MockPrinter::new();
        mock.expect_print().with(eq("Hello, world!")).times(1).return_const(());

        let print = move |s: &_| mock.print(s);

        let mut m = load_test_program("hello-world.asm");
        m.is_debug = true;
        m.handlers.print.push(Box::new(print));
        m.run();

        assert_eq!(m.mem.read_stack(1), [0], "stack should be empty");
    }
}