use machine::canvas::block::BlockData;
use machine::canvas::wire::Port;
use machine::canvas::{Canvas, CanvasError};
use machine::Register::{FP, PC, SP};
use machine::{Event, Message};
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

fn returns<T: Serialize>(value: Result<T, CanvasError>) -> Return {
    match value {
        Ok(v) => Ok(to_value(&v)?),
        Err(error) => Err(to_value(&error)?),
    }
}

fn return_raw<T: Serialize>(value: Result<T, CanvasError>) -> Result<T, JsValue> {
    match value {
        Ok(v) => Ok(v),
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

    pub fn get_blocks(&self) -> Return {
        Ok(to_value(&self.canvas.blocks)?)
    }

    pub fn get_block(&self, id: u16) -> Return {
        returns(self.canvas.get_block(id))
    }

    pub fn get_blocks_data(&self) -> Return {
        let blocks_data: Vec<BlockData> =
            self.canvas.blocks.iter().map(|b| b.data.clone()).collect();

        Ok(to_value(&blocks_data)?)
    }

    pub fn get_wires(&self) -> Return {
        Ok(to_value(&self.canvas.wires)?)
    }

    pub fn add_block(&mut self, data: JsValue) -> Result<u16, JsValue> {
        return_raw(self.canvas.add_block(from_value(data)?))
    }

    pub fn add_block_with_id(&mut self, id: u16, data: JsValue) -> Return {
        returns(self.canvas.add_block_with_id(id, from_value(data)?))
    }

    pub fn add_machine(&mut self) -> Result<u16, JsValue> {
        return_raw(self.canvas.add_machine())
    }

    pub fn add_machine_with_id(&mut self, id: u16) -> Return {
        returns(self.canvas.add_machine_with_id(id))
    }

    pub fn remove_block(&mut self, id: u16) -> Return {
        returns(self.canvas.remove_block(id))
    }

    pub fn connect(&mut self, from: Port, to: Port) -> Result<u16, JsValue> {
        return_raw(self.canvas.connect(from, to))
    }

    pub fn disconnect(&mut self, from: Port, to: Port) -> Return {
        returns(self.canvas.disconnect(from, to))
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

    pub fn send_message(&mut self, message: JsValue) -> Return {
        returns(self.canvas.send_message(from_value(message)?))
    }

    pub fn send_message_to_block(&mut self, block_id: u16, action: JsValue) -> Return {
        returns(
            self.canvas
                .send_message_to_block(block_id, from_value(action)?),
        )
    }

    pub fn update_block(&mut self, id: u16, data: JsValue) -> Return {
        returns(self.canvas.update_block(id, from_value(data)?))
    }

    pub fn reset_blocks(&mut self) -> Return {
        returns(self.canvas.reset_blocks())
    }

    pub fn reset_block(&mut self, id: u16) -> Return {
        returns(self.canvas.reset_block(id))
    }

    pub fn set_await_watchdog(&mut self, state: bool) {
        self.canvas.set_await_watchdog(state)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
