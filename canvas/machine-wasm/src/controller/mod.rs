use machine::{Event, Execute, Message, Router};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use web_sys::console;

const NULL: JsValue = JsValue::NULL;

#[wasm_bindgen]
pub struct Controller {
    #[wasm_bindgen(skip)]
    pub router: Router,
}

/// Machine state returned by the inspection function.
#[derive(Serialize, Deserialize)]
pub struct InspectState {
    pub stack: Vec<u16>,
    pub events: Vec<Event>,
    pub mailbox: Vec<Message>,
}

type Return = Result<JsValue, JsValue>;

#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {
            router: Router::new(),
        }
    }

    /// Add a machine.
    pub fn add(&mut self) -> u16 {
        self.router.add()
    }

    /// Load a program into the machine.
    pub fn load(&mut self, id: u16, source: &str) {
        self.router.load(id, source)
    }

    /// Check if every machine is halted.
    pub fn is_halted(&self) -> bool {
        self.router.is_halted()
    }

    /// Run a single machine in isolation.
    pub fn run_isolated(&mut self, id: u16, source: &str) {
        self.load(id, source);

        let Some(m) = self.router.get_mut(id) else {
            return;
        };

        m.tick();
    }

    pub fn inspect(&mut self, id: u16) -> Return {
        let Some(m) = self.router.get_mut(id) else {
            return Ok(NULL);
        };

        let state = InspectState {
            events: m.events.clone(),
            mailbox: m.mailbox.clone(),
            stack: m.mem.read_stack(10),
        };

        Ok(to_value(&state)?)
    }

    pub fn step_all(&mut self) {
        self.router.step();
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
