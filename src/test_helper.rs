use std::fs;
use crate::Machine;

pub fn load_test_file(path: &str) -> String {
    let path = env!("CARGO_MANIFEST_DIR").to_owned() + "/tests/asm/" + path;
    fs::read_to_string(path).unwrap()
}

pub fn load_test_program(path: &str) -> Machine {
    (*load_test_file(path)).into()
}
