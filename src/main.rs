use opcodes_to_algorithms::{Execute, Instruction as I, Load, Machine, WithStringManager};

fn main() {
    let mut m = Machine::new();
    m.handlers.print.push(Box::new(|s| print!("{}", s)));

    let welcome_ptr = m.mem.string().add_str("hello, world!");
    m.mem.load_code(vec![I::Push(welcome_ptr), I::Print]);
    m.run();
}