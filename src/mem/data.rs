use crate::mem::Memory;

pub const MIN_DATA_ADDR: u16 = 0x1000;
pub const MAX_DATA_ADDR: u16 = 0x1000;

struct DataManager<'a> {
    m: &'a mut Memory,
}

impl<'a> DataManager<'a> {
    fn from(m: &'a mut Memory) -> DataManager<'a> {
        DataManager { m }
    }

    fn write(&mut self, at: u16, val: &[u16]) {
        let base = MIN_DATA_ADDR + at;

        for (i, v) in val.iter().enumerate() {
            self.m.set(base + i as u16, *v);
        }
    }

    fn read(&self, offset: u16, count: u16) -> Vec<u16> {
        self.m.read(MIN_DATA_ADDR + offset, count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_write() {
        let mut m = Memory::new();
        let mut d = DataManager::from(&mut m);

        d.write(0, &[2, 3, 4]);
        assert_eq!(d.read(0, 3), [2, 3, 4]);
        assert_eq!(m.read(MIN_DATA_ADDR, 3), [2, 3, 4]);
    }
}