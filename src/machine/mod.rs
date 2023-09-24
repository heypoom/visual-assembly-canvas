use snafu::Whatever;
use crate::mem::{Memory, StackManager};
use crate::register::Registers;
use crate::register::Register::PC;
use crate::instructions::Instruction as I;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
}

impl Machine {
    pub fn new() -> Machine {
        let mut mem = Memory::new();
        let reg = Registers::new();


        Machine {
            mem,
            reg,
        }
    }

    fn stack(&mut self) -> StackManager {
        StackManager::new(&mut self.mem, &mut self.reg)
    }

    pub fn tick(&mut self) -> Result<(), Whatever> {
        let pc = self.reg.get(PC);
        let op_code = self.mem.get(pc);
        let op: I = op_code.into();

        match op {
            I::None => {}
            I::Push(_) => {
                let arg = self.mem.get(pc + 1);
                self.stack().push(arg).unwrap();
            },
            I::Pop => {
                // TODO: what to do with the popped value?
                let v = self.stack().pop().unwrap();
                println!("Pop: {}", v);
            }
            I::Add => {
                // TODO: implement ADD
            }
            I::Sub => {
                // TODO: implement SUB
            }
            I::Mul => {
                // TODO: implement MUL
            }
            I::Div => {
                // TODO: implement DIV
            }
            I::Halt => {}
        };

        Ok(())
    }
}
