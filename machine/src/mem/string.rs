extern crate snafu;

use crate::mem::{DATA_END, DATA_START, Memory};
use crate::ParseError;
use crate::ParseError::InvalidString;

type Errorable = Result<String, ParseError>;

pub struct StringManager<'a> {
    pub mem: &'a mut Memory,
    pub top: u16,
}

impl<'a> StringManager<'a> {
    fn new(mem: &'a mut Memory) -> StringManager<'a> {
        StringManager { mem, top: DATA_START }
    }

    /// Add the given data to the data section.
    pub fn add_data(&mut self, value: &[u16]) -> u16 {
        let t = self.top;
        self.mem.write(t, value);
        self.top += value.len() as u16;

        t
    }

    /// Add the given string to the data section.
    pub fn add_str(&mut self, value: &str) -> u16 {
        self.add_data(&str_to_u16(value))
    }

    /// Get the string at the given address.
    pub fn get_str(&self, addr: u16) -> Errorable {
        let v16 = self.get_str_bytes(addr);

        self.get_str_from_bytes(v16)
    }

    /// Get the string at the given address.
    pub fn get_str_from_bytes(&self, v16: Vec<u16>) -> Errorable {
        // TODO: Properly decode high UTF-8 bytes such as emojis.
        let v8: Vec<u8> = v16.iter().map(|&x| x as u8).collect();

        match String::from_utf8(v8) {
            Ok(s) => Ok(s),
            Err(_) => Err(InvalidString)
        }
    }

    /// Get the string bytes until the null terminator.
    /// TODO: add tests for get_str_bytes
    pub fn get_str_bytes(&self, addr: u16) -> Vec<u16> {
        let mut data = vec![];

        for i in addr.. {
            // We've reached the end of the data section.
            if i > DATA_END { break; }

            // Read the value at the current address.
            let v = self.mem.get(i);

            // We've reached the null terminator.
            if v == 0x00 { break; }

            data.push(v);
        };

        data
    }
}

pub trait WithStringManager {
    fn string(&mut self) -> StringManager;
}

impl WithStringManager for Memory {
    fn string(&mut self) -> StringManager {
        StringManager::new(self)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_str() -> Errorable {
        let mut m = Memory::new();
        let mut s = m.string();

        let hello_ptr = s.add_str("hello");
        let hello = s.get_str(hello_ptr)?;
        assert_eq!(hello, "hello");

        let world_ptr = s.add_str("world");
        let world = s.get_str(world_ptr)?;
        assert_eq!(world, "world");

        Ok(())
    }
}

pub fn str_to_u16(s: &str) -> Vec<u16> {
    let mut v: Vec<u16> = s.chars().map(|c| c as u16).collect();
    v.push(0x00);
    v
}