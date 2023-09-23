use std::{process::Output, slice::SliceIndex};

type M = [u8; 0xFF];

#[derive(Debug)]
struct CPU {
    memory: M,
}

impl CPU {
    fn new() -> CPU {
        CPU { memory: [0; 0xFF] }
    }

    fn mset(&mut self, addr: usize, val: u8) {
        self.memory[addr] = val;
    }

    fn mget(&self, addr: usize) -> u8 {
        self.memory[addr]
    }
}

fn main() {
    let mut cpu = CPU::new();
    cpu.mset(0, 1);
    println!("{}", cpu.mget(0));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory() {
        let mut cpu = CPU::new();

        cpu.mset(0, 1);
        assert_eq!(cpu.mget(0), 1);
        assert_eq!(cpu.mget(1), 0);
    }
}
