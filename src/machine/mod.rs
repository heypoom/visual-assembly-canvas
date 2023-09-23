use crate::mem::Memory;
use crate::register::Registers;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,

}

impl Machine {
    pub fn new() -> Machine {
        let mem = Memory::new();
        let reg = Registers::new();


        Machine {
            mem,
            reg,
        }
    }
}
