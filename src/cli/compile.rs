use std::fs;
use crate::{Parser, compile};
use crate::cli::bytes::u16_vec_to_u8;

/// Signature of the binary file.
pub static MAGIC_BYTES: [u16; 2] = [0xDEAD, 0xBEEF];

pub fn compile_to_file(src_path: &str, out_path: &str) {
    let source = fs::read_to_string(&src_path).unwrap();
    let bytes = u16_vec_to_u8(compile_to_binary(&source));

    fs::write(out_path, bytes).expect("cannot write bytecode to file");
}

pub fn compile_to_binary(source: &str) -> Vec<u16> {
    let parser: Parser = (*source).into();

    // [code_start, code_size, data_start, data_size]
    let mut header: [u16; 4] = [0x00, 0x00, 0x00, 0x00];

    // Code segment.
    let code_segment = compile(parser.ops);
    let code_start = MAGIC_BYTES.len() + header.len();
    header[0] = code_start as u16;
    header[1] = code_segment.len() as u16;

    // Data segment.
    let data_segment = parser.symbols.bytes();
    let data_start = code_start + code_segment.len();
    header[2] = data_start as u16;
    header[3] = data_segment.len() as u16;

    // Pack into binary.
    let mut bytes = vec![];
    bytes.extend(MAGIC_BYTES.to_vec());
    bytes.extend(header.to_vec());
    bytes.extend(code_segment);
    bytes.extend(data_segment);
    bytes
}