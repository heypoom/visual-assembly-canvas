use wasm_bindgen::prelude::*;

use machine::Machine;

#[wasm_bindgen]
pub fn load_code(code: &str) -> Vec<u16> {
    let m: Machine = code.into();
    m.mem.read_stack(10)
}
