#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use mockall::{automock, predicate::*};
    use O::{Machine as M, Execute, Instruction as I, Load, WithStringManager};

    #[cfg_attr(test, automock)]
    trait Printer {
        fn print(&self, s: &str);
    }

    #[test]
    fn test_print_hello_world() {
        let mut m = M::new();

        let mut ms = m.mem.string();
        let h_addr = ms.add_str("hello, ");
        let w_addr = ms.add_str("world!");

        m.mem.load_code(vec![I::Push(h_addr), I::Print, I::Push(w_addr), I::Print]);

        let mut print_m = MockPrinter::new();
        print_m.expect_print().with(eq("hello, ")).times(1).return_const(());
        print_m.expect_print().with(eq("world!")).times(1).return_const(());

        let print = move |s: &_| print_m.print(s);
        m.handlers.print.push(Box::new(print));

        m.run();
        assert_eq!(m.mem.read_stack(1), [0], "stack should be empty");
    }
}