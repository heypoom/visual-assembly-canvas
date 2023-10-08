mod utils;

use machine::{Execute, Machine};
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::console_log;

#[wasm_bindgen]
extern "C" {
    //
}

#[wasm_bindgen]
pub fn load_machine(source: &str) -> Vec<u16> {
    let mut m: Machine = source.into();
    m.run();
    let stack = m.mem.read_stack(10);

    console_log!("load_machine: {:?}", m.mem.read_stack(10));
    stack
}
