pub mod instructions;
pub mod machine;
pub mod mem;
pub mod register;

use crate::register::Register::PC;
use machine::Machine;

fn main() {
    let mut cpu = Machine::new();
    println!("{}", cpu.mem.get(0));

    cpu.reg.set(PC, 0x0001);
}
