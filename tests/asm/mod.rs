use std::fs::File;
use std::io::Read;
use opcodes_to_algorithms::Machine;

pub fn load_test_file(path: &str) -> String {
    let path = env!("CARGO_MANIFEST_DIR").to_owned() + "/tests/asm/" + path;
    let mut file = File::open(path).expect("missing file");
    let mut content = String::new();
    file.read_to_string(&mut content).unwrap();

    content
}

#[cfg(test)]
pub fn load_test_program(path: &str) -> Machine {
    (*load_test_file(path)).into()
}