use std::fs;
use crate::{Parser, compile};
use crate::cli::bytes::u16_vec_to_u8;

pub fn compile_to_file(src_path: &str, out_path: &str) {
    let source = fs::read_to_string(&src_path).unwrap();
    let parser: Parser = (*source).into();

    let file_bytes = u16_vec_to_u8(compile(parser.instructions));

    fs::write(out_path, &file_bytes).expect("cannot write bytecode to file");
}
