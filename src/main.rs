mod mem;

use self::mem::Memory;

#[derive(Debug)]
struct CPU {
    mem: Memory,
}

impl CPU {
    fn new() -> CPU {
        CPU { mem: Memory::new() }
    }
}

fn main() {
    let cpu = CPU::new();
    println!("{}", cpu.mem.get(0));
}
