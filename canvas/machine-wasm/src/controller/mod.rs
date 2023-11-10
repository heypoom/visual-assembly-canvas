use machine::Register::{FP, PC, SP};
use machine::{Event, Message};
use machine::canvas::{Canvas, CanvasError};
use machine::canvas::block::BlockData;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

const NULL: JsValue = JsValue::NULL;

#[wasm_bindgen]
pub struct Controller {
    #[wasm_bindgen(skip)]
    pub canvas: Canvas,
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

fn returns<T>(value: Result<T, CanvasError>) -> Return {
    match value {
        Ok(..) => Ok(NULL),
        Err(error) => Err(to_value(&error)?),
    }
}

/// Controls the interaction between machines and blocks.
#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {
            canvas: Canvas::new(),
        }
    }

    pub fn add_block_with_id(&mut self, id: u16, data: JsValue) -> Return {
        let block: BlockData = from_value(data)?;

        returns(self.canvas.add_block_with_id(id, block))
    }

    pub fn add_machine(&mut self) -> Return {
        returns(self.canvas.add_machine())
    }

    pub fn add_machine_with_id(&mut self, id: u16) -> Return {
        returns(self.canvas.add_machine_with_id(id))
    }

    pub fn load(&mut self, id: u16, source: &str) -> Return {
        returns(self.canvas.load_program(id, source))
    }

    pub fn ready(&mut self) {
        self.canvas.seq.ready()
    }

    pub fn step(&mut self) -> Return {
        returns(self.canvas.tick())
    }

    pub fn run(&mut self) -> Return {
        returns(self.canvas.run())
    }

    pub fn statuses(&mut self) -> Return {
        Ok(to_value(&self.canvas.seq.get_statuses())?)
    }

    pub fn is_halted(&self) -> bool {
        self.canvas.seq.is_halted()
    }

    pub fn inspect(&mut self, id: u16) -> Return {
        let Some(m) = self.canvas.seq.get_mut(id) else {
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
        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(NULL);
        };

        Ok(to_value(&m.mem.read_code(size))?)
    }

    /// Allows the frontend to consume events from the machine.
    pub fn consume_side_effects(&mut self, id: u16) -> Return {
        Ok(to_value(&self.canvas.seq.consume_side_effects(id))?)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
