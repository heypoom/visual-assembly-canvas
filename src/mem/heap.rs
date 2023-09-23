use std::rc::Rc;
use crate::mem::Memory;
use crate::register::Register;

pub struct HeapManager {
    mem: Rc<Memory>,
    reg: Rc<Register>
}

impl HeapManager {
    fn alloc(&mut self, size: usize) -> u8 {
        todo!()
    }

    fn free(&mut self, ptr: u8, size: usize) {
        todo!()
    }
}

