use std::fs;
use crate::cli::bytes::u8_vec_to_u16;
use crate::{CODE_START, Execute, Machine, Parser};

pub fn run_from_bytecode(path: &str) {
    let bytes = fs::read(path).expect("cannot read bytecode file");
    let bytecode = u8_vec_to_u16(bytes);

    let mut m = Machine::new();
    // m.is_debug = true;

    m.mem.write(CODE_START, &bytecode);
    m.run();

    println!("{:?}", m.mem.read_stack(10));
}

pub fn run_from_source(path: &str) {
    let source = fs::read_to_string(path).expect("cannot read source file");
    let p: Parser = (*source).into();
    let mut m: Machine = p.instructions.into();
    m.is_debug = true;
    m.run();

    println!("{:?}", m.mem.read_stack(10));
}

