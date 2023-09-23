mod machine;
mod register;
mod mem;

use machine::Machine;

fn main() {
    let cpu = Machine::new();
    println!("{}", cpu.mem.get(0));
}
