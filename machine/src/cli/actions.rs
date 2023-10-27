use std::fs;
use crate::binary::bytes::{u16_vec_to_u8, u8_vec_to_u16};
use crate::{Execute, Machine};
use crate::compile::compile_to_binary;
use crate::run::load_from_binary;

pub fn compile_to_file(src_path: &str, out_path: &str) {
    let source = fs::read_to_string(&src_path).unwrap();
    let bytes = u16_vec_to_u8(compile_to_binary(&source));

    fs::write(out_path, bytes).expect("cannot write bytecode to file");
}

pub fn run_from_binary_file(path: &str, is_debug: bool) {
    let bytes = fs::read(path).expect("cannot read bytecode file");

    let mut m = load_from_binary(&u8_vec_to_u16(bytes));
    m.is_debug = is_debug;
    m.run();

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }
}

pub fn run_from_source(path: &str, is_debug: bool) {
    let source = fs::read_to_string(path).expect("cannot read source file");

    let mut m: Machine = (*source).into();
    m.is_debug = is_debug;
    m.run();

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }
}

