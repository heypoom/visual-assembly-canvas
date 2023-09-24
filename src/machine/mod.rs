use snafu::Whatever;
use crate::mem::{Memory, StackManager};
use crate::register::Registers;
use crate::register::Register::PC;
use crate::instructions::{Instruction, Load};
use crate::instructions::Instruction as I;

#[derive(Debug)]
pub struct Machine {
    pub mem: Memory,
    pub reg: Registers,
}

fn stack(m: &mut Machine) -> StackManager {
    StackManager::new(&mut m.mem, &mut m.reg)
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

    pub fn tick(&mut self) -> Result<(), Whatever> {
        let pc = self.reg.get(PC);
        let op_code = self.mem.get(pc);
        let op: I = op_code.into();



        match op {
            I::None => {}
            I::Push(_) => {
                let arg = self.mem.get(pc + 1);
                let mut s = stack(self);
                s.push(arg).unwrap();
            },
            I::Pop => {
                let mut s = stack(self);
                let v = s.pop();
                println!("Pop: {:?}", v);
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
