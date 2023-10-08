use crate::{Execute, Machine, CODE_START, DATA_START};
use super::compile::MAGIC_BYTES;

pub fn run_from_binary_bytes(bytes: Vec<u16>, is_debug: bool) {
    if bytes[0..2] != MAGIC_BYTES[0..2] {
        panic!("invalid binary signature");
    }

    let header: Vec<usize> = bytes[2..6].iter().map(|&x| x as usize).collect();

    let [code_ptr, code_len, data_ptr, data_len] = header[..] else {
        panic!("cannot read header");
    };

    let mut m = Machine::new();
    m.is_debug = is_debug;
    m.handlers.print.push(Box::new(|s: &_| print!("{}", s)));

    let code_bytes = bytes[code_ptr..(code_ptr + code_len)].to_vec();
    let data_bytes = bytes[data_ptr..(data_ptr + data_len)].to_vec();

    m.mem.write(CODE_START, &code_bytes);
    m.mem.write(DATA_START, &data_bytes);
    m.run();

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }
}

