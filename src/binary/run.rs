use crate::{Machine, CODE_START, DATA_START};
use super::compile::MAGIC_BYTES;

pub fn load_from_binary(bytes: &[u16]) -> Machine {
    // Verify magic bytes.
    if bytes[0..2] != MAGIC_BYTES[0..2] {
        panic!("invalid binary signature");
    }

    let header: Vec<usize> = bytes[2..6].iter().map(|&x| x as usize).collect();

    // Read header from binary.
    let [code_ptr, code_len, data_ptr, data_len] = header[..] else {
        panic!("cannot read header");
    };

    // Read segments from binary.
    let code_bytes = bytes[code_ptr..(code_ptr + code_len)].to_vec();
    let data_bytes = bytes[data_ptr..(data_ptr + data_len)].to_vec();

    // Load the segments into memory.
    let mut m = Machine::new();
    m.mem.write(CODE_START, &code_bytes);
    m.mem.write(DATA_START, &data_bytes);
    m
}
