use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use machine::{Event, Execute, Machine};

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct Controller {}

#[derive(Serialize, Deserialize)]
pub struct RunResult {
    pub stack: Vec<u16>,
    pub events: Vec<Event>
}

#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {}
    }

    pub fn run_code(source: &str) -> Result<JsValue, JsValue> {
        let mut m: Machine = source.into();
        m.run();

        let stack = m.mem.read_stack(10);
        let events = m.events.clone();
        let result = RunResult { stack, events };

        Ok(serde_wasm_bindgen::to_value(&result)?)
    }
}