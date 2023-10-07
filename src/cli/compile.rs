use std::fs;
use crate::{Parser, compile};
use crate::cli::bytes::u16_vec_to_u8;

pub static MAGIC_HEADER: [u16; 2] = [0xDEAD, 0xBEEF];

pub fn compile_to_file(src_path: &str, out_path: &str) {
    let source = fs::read_to_string(&src_path).unwrap();
    let parser: Parser = (*source).into();

    let mut bytes: Vec<u8> = vec![];
    let mut write = |data| bytes.extend(u16_vec_to_u8(data));

    // [data_start]
    let mut info_header: [u16; 2] = [0x00, 0x00];

    let code_segment = compile(parser.ops);
    let code_start = MAGIC_HEADER.len() + info_header.len() + 1;
    let data_start = code_start + code_segment.len() + 1;

    info_header[0] = code_start as u16;
    info_header[1] = data_start as u16;

    write(MAGIC_HEADER.into());
    write(info_header.into());
    write(code_segment);
    write(parser.symbols.bytes());

    fs::write(out_path, &bytes).expect("cannot write bytecode to file");
}
