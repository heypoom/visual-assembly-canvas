use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use machine::{Execute, Machine};

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct Controller {}

#[derive(Serialize, Deserialize)]
pub struct RunResult {
    pub stack: Vec<u16>,
    pub logs: Vec<String>
}

#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {}
    }

    pub fn run_code(source: &str) -> Result<JsValue, JsValue> {
        let mut m: Machine = source.into();
        m.run();

        let logs: Vec<String> = m.events.iter().map(|e| {
            match e {
                machine::Event::Print { text } => text.clone()
            }
        }).collect();

        let stack = m.mem.read_stack(10);
        let result = RunResult { stack, logs };

        Ok(serde_wasm_bindgen::to_value(&result)?)
    }
}