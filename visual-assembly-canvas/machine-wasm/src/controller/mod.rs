use machine::{Execute, Machine};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Controller {

}

#[wasm_bindgen]
pub struct RunResult {
    stack: Vec<u16>,
    logs: Vec<String>
}

#[wasm_bindgen]
impl Controller {
    pub fn run_code(&self, source: &str) -> RunResult {
        let mut m: Machine = source.into();

        m.run();

        let stack = m.mem.read_stack(10);
        RunResult { stack, logs: logs.clone() }
    }
}