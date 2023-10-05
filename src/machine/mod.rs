mod decode;
mod execute;
mod handlers;

use crate::instructions::{Instruction, Load};
use crate::machine::handlers::Handlers;
use crate::mem::{Memory, StackManager};
use crate::register::Registers;

pub use self::decode::Decode;
pub use self::execute::Execute;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
    pub handlers: Handlers,
}

impl Machine {
    /// Creates a new machine.
    pub fn new() -> Machine {
        Machine { mem: Memory::new(), reg: Registers::new(), handlers: Handlers::new() }
    }

    /// Returns a stack manager for the current machine.
    pub fn stack(&mut self) -> StackManager {
        StackManager::new(&mut self.mem, &mut self.reg)
    }
}

impl From<Vec<Instruction>> for Machine {
    fn from(code: Vec<Instruction>) -> Self {
        let mut m = Machine::new();
        m.mem.load_code(code);
        m
    }
}

