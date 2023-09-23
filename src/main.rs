mod mem;

use self::mem::Memory;

#[derive(Debug)]
struct Machine {
    mem: Memory,
}

impl Machine {
    fn new() -> Machine {
        Machine { mem: Memory::new() }
    }
}

fn main() {
    let cpu = Machine::new();
    println!("{}", cpu.mem.get(0));
}
