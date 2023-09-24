pub mod instructions;
pub mod machine;
pub mod mem;
pub mod register;

use machine::Machine as M;
use instructions::Instruction as I;
use crate::machine::Execute;

fn main() {
    let mut m: M = vec![
        I::Push(0),
        I::Inc,
        I::Push(10),
        I::Equal,
        I::JumpNotZero(0x01),
        I::Push(20),
    ].into();

    m.run();
}
