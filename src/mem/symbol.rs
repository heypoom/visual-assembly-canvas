use snafu::{Whatever, whatever};
use crate::mem::{DATA_END, DATA_START, Memory};

pub struct StringManager<'a> {
    mem: &'a mut Memory,
    top: u16,
}

impl<'a> StringManager<'a> {
    fn new(mem: &'a mut Memory) -> StringManager<'a> {
        StringManager { mem, top: DATA_START }
    }

    /// Add the given data to the data section.
    fn add_data(&mut self, value: &[u16]) -> u16 {
        let t = self.top;
        self.mem.write(t, value);
        self.top += value.len() as u16;

        t
    }

    /// Add the given string to the data section.
    fn add_str(&mut self, value: &str) -> u16 {
        let mut v: Vec<u16> = value.chars().map(|c| c as u16).collect();

        // Add the null terminator.
        v.push(0x00);

        self.add_data(&v)
    }

    /// Get the string at the given address.
    fn get_str(&self, addr: u16) -> Result<String, Whatever> {
        let v16 = self.get_str_bytes(addr);

        // TODO: Properly decode high UTF-8 bytes such as emojis.
        let v8: Vec<u8> = v16.iter().map(|&x| x as u8).collect();

        match String::from_utf8(v8) {
            Ok(s) => Ok(s),
            Err(e) => whatever!("read_str error: {e}")
        }
    }

    /// Get the string bytes until the null terminator.
    fn get_str_bytes(&self, addr: u16) -> Vec<u16> {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_str() {
        let mut m = Memory::new();
        let mut s = StringManager::new(&mut m);

        let hello_ptr = s.add_str("hello");
        let hello = s.get_str(hello_ptr).unwrap();
        assert_eq!(hello, "hello");

        let world_ptr = s.add_str("world");
        let world = s.get_str(world_ptr).unwrap();
        assert_eq!(world, "world");
    }
}