use machine::{Event, Message, Router, RouterError};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

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

fn returns(value: Result<(), RouterError>) -> Return {
    match value {
        Ok(()) => Ok(NULL),
        Err(error) => Err(to_value(&error)?),
    }
}

/// Controls the interaction between machines and blocks.
#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {
            router: Router::new(),
        }
    }

    pub fn add(&mut self) -> u16 {
        self.router.add()
    }

    pub fn load(&mut self, id: u16, source: &str) -> Return {
        returns(self.router.load(id, source))
    }

    pub fn ready(&mut self) {
        self.router.ready()
    }

    pub fn step(&mut self) -> Return {
        returns(self.router.step())
    }

    pub fn run(&mut self) -> Return {
        returns(self.router.run())
    }

    pub fn is_halted(&self) -> bool {
        self.router.is_halted()
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

    pub fn consume_events(&mut self, id: u16) -> Return {
        let Some(m) = self.router.get_mut(id) else {
            return Ok(NULL);
        };

        let events = m.events.clone();
        m.events.clear();

        Ok(to_value(&events)?)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
