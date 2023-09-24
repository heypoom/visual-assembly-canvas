pub mod register;
pub mod mem;
pub mod instructions;
pub mod machine;

use machine::Machine;
use crate::register::Register::PC;

fn main() {
    let mut cpu = Machine::new();
    println!("{}", cpu.mem.get(0));

    cpu.reg.set(PC, 0x0001);
}
