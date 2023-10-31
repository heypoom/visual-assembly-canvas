use machine::Register::{FP, PC, SP};
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

#[derive(Serialize, Deserialize)]
pub struct InspectRegister {
    pc: u16,
    sp: u16,
    fp: u16,
}

/// Machine state returned by the inspection function.
#[derive(Serialize, Deserialize)]
pub struct InspectState {
    pub stack: Vec<u16>,
    pub events: Vec<Event>,
    pub inbox: Vec<Message>,
    pub registers: InspectRegister,
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

    pub fn statuses(&mut self) -> Return {
        Ok(to_value(&self.router.get_statuses())?)
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
            inbox: m.inbox.clone(),
            stack: m.mem.read_stack(10),
            registers: InspectRegister {
                pc: m.reg.get(PC),
                sp: m.reg.get(SP),
                fp: m.reg.get(FP),
            },
        };

        Ok(to_value(&state)?)
    }

    pub fn read_code(&mut self, id: u16, size: u16) -> Return {
        let Some(m) = self.router.get_mut(id) else {
            return Ok(NULL);
        };

        Ok(to_value(&m.mem.read_code(size))?)
    }

    /// Allows the frontend to consume events from the machine.
    pub fn consume_side_effects(&mut self, id: u16) -> Return {
        Ok(to_value(&self.router.consume_side_effects(id))?)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
