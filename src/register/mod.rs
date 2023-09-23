const R_SIZE: usize = 0xF;

pub struct Registers {
    buffer: [u8; R_SIZE],
}

pub enum Register {
    // General Purpose Registers
    R01 = 0x01,
    R02 = 0x02,
    R03 = 0x03,
    R04 = 0x04,
    R05 = 0x05,
    R06 = 0x06,
    R07 = 0x07,
    R08 = 0x08,
    R09 = 0x09,
    R10 = 0x0A,

    /// Frame Pointer
    FP = 0x0B,

    /// Stack Pointer
    SP = 0x0C,

    /// Program Counter
    PC = 0x0D,

    /// Status Register
    SR = 0x0E,
}

impl Registers {
    pub fn new() -> Registers {
        Registers {
            buffer: [0; R_SIZE],
        }
    }

    pub fn set(&mut self, r: Register, val: u8) {
        self.buffer[r as usize] = val;
    }

    pub fn get(&self, r: Register) -> u8 {
        self.buffer[r as usize]
    }
}

#[cfg(test)]
mod tests {
    use super::Register::{FP, PC};
    use super::*;

    #[test]
    fn test_set_register() {
        let mut r = Registers::new();
        r.set(FP, 0x10);
        assert_eq!(r.get(FP), 0x10);

        r.set(PC, 0xFF);
        assert_eq!(r.get(PC), 0xFF);
    }
}
