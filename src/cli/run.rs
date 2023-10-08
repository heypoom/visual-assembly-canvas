use std::fs;
use crate::cli::bytes::u8_vec_to_u16;
use crate::{CODE_START, Execute, Machine};

pub fn run_from_bytecode(path: &str, is_debug: bool) {
    let raw_bytes = fs::read(path).expect("cannot read bytecode file");
    let bytes = u8_vec_to_u16(raw_bytes);

    let mut m = Machine::new();
    m.is_debug = is_debug;
    m.handlers.print.push(Box::new(|s: &_| print!("{}", s)));

    m.mem.write(CODE_START, &bytes);
    m.run();

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }
}

pub fn run_from_source(path: &str, is_debug: bool) {
    let source = fs::read_to_string(path).expect("cannot read source file");

    let mut m: Machine = (*source).into();
    m.is_debug = is_debug;
    m.handlers.print.push(Box::new(|s: &_| print!("{}", s)));
    m.run();

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }
}

