mod decode;
mod execute;
mod handlers;

use crate::{CALL_STACK_END, CALL_STACK_START, Parser};
use crate::instructions::{Instruction, Load};
use crate::machine::handlers::Handlers;
use crate::mem::{Memory, StackManager};
use crate::Register::FP;
use crate::register::Registers;

pub use self::decode::Decode;
pub use self::execute::Execute;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
    pub handlers: Handlers,

    pub is_debug: bool,
}

impl Machine {
    /// Creates a new machine.
    pub fn new() -> Machine {
        Machine {
            mem: Memory::new(),
            reg: Registers::new(),
            handlers: Handlers::new(),

            is_debug: false,
        }
    }

    /// Returns a stack manager for the current machine.
    pub fn stack(&mut self) -> StackManager {
        let mut s = StackManager::new(&mut self.mem, &mut self.reg);
        s.is_debug = self.is_debug;
        s
    }

    pub fn call_stack(&mut self) -> StackManager {
        let mut stack = self.stack();
        stack.sp = FP;
        stack.min = CALL_STACK_START;
        stack.max = CALL_STACK_END;
        stack
    }
}

impl From<Vec<Instruction>> for Machine {
    fn from(code: Vec<Instruction>) -> Self {
        let mut m = Machine::new();
        m.mem.load_code(code);
        m
    }
}

impl From<&str> for Machine {
    fn from(source: &str) -> Self {
        let p: Parser = source.into();
        p.instructions.into()
    }
}

