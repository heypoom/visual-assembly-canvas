mod decode;
mod execute;
mod handlers;

use crate::{Op, Registers, Register::FP, Parser, CALL_STACK_END, CALL_STACK_START};
use crate::machine::handlers::Handlers;
use crate::mem::{Memory, StackManager};

pub use self::decode::Decode;
pub use self::execute::Execute;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
    pub handlers: Handlers,

    /// Identifier of the machine.
    pub id: Option<u16>,

    /// Is the machine in debug mode?
    pub is_debug: bool,
}

impl Machine {
    /// Creates a new machine.
    pub fn new() -> Machine {
        Machine {
            mem: Memory::new(),
            reg: Registers::new(),
            handlers: Handlers::new(),

            id: None,
            is_debug: false,
        }
    }

    /// Returns a stack orchestrator for the current machine.
    pub fn stack(&mut self) -> StackManager {
        let mut stack = StackManager::new(&mut self.mem, &mut self.reg);
        stack.is_debug = self.is_debug;
        stack
    }

    pub fn call_stack(&mut self) -> StackManager {
        let mut stack = self.stack();
        stack.sp = FP;
        stack.min = CALL_STACK_START;
        stack.max = CALL_STACK_END;
        stack
    }
}

impl From<Vec<Op>> for Machine {
    fn from(code: Vec<Op>) -> Self {
        let mut m = Machine::new();
        m.mem.load_code(code);
        m
    }
}

impl From<&str> for Machine {
    fn from(source: &str) -> Self {
        let p: Parser = source.into();
        let mut m: Self = p.ops.into();
        m.mem.load_symbols(p.symbols);
        m
    }
}

