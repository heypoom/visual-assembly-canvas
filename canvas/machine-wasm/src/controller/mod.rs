use machine::blocks::{BlockDataByType, InternalBlockData};
use machine::canvas::wire::{Port, Wire};
pub use machine::canvas::{Canvas, CanvasError};
use machine::status::MachineStatus;
use machine::Register::{FP, PC, SP};
use machine::{Action, Event, Message};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

const NULL: JsValue = JsValue::NULL;

#[wasm_bindgen]
pub struct Controller {
    #[wasm_bindgen(skip)]
    pub canvas: Canvas,
}

#[derive(Serialize, Deserialize)]
pub struct InspectedRegister {
    pc: u16,
    sp: u16,
    fp: u16,
}

/// Machine state returned by the inspection function.
#[derive(Serialize, Deserialize)]
pub struct InspectedMachine {
    pub events: Vec<Event>,
    pub registers: InspectedRegister,

    pub inbox_size: usize,
    pub outbox_size: usize,
    pub status: MachineStatus,
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
        let blocks_data: Vec<BlockDataByType> =
            self.canvas.blocks.iter().map(|b| b.data.clone()).collect();

        Ok(to_value(&blocks_data)?)
    }

    pub fn get_wires(&self) -> Return {
        Ok(to_value(&self.canvas.wires)?)
    }

    pub fn add_block(&mut self, data: BlockDataByType) -> Result<u16, JsValue> {
        return_raw(self.canvas.add_block(data))
    }

    pub fn add_external_block(&mut self, name: String, data: Vec<u8>) -> Result<u16, JsValue> {
        return_raw(
            self.canvas
                .add_block(BlockDataByType::External { name, data }),
        )
    }

    pub fn add_external_block_with_id(
        &mut self,
        id: u16,
        name: String,
        data: Vec<u8>,
    ) -> Return {
        returns(self.canvas.add_block_with_id(id, BlockDataByType::External { name, data }))
    }

    pub fn add_block_with_id(&mut self, id: u16, data: BlockDataByType) -> Return {
        returns(self.canvas.add_block_with_id(id, data))
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

    pub fn step(&mut self, count: u16) -> Return {
        returns(self.canvas.tick(count))
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

    pub fn inspect_machine(&mut self, id: u16) -> Return {
        let Some(status) = self.canvas.seq.statuses.get(&id) else {
            return Ok(NULL);
        };

        let status = status.clone();

        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(NULL);
        };

        let state = InspectedMachine {
            events: m.events.clone(),
            registers: InspectedRegister {
                pc: m.reg.get(PC),
                sp: m.reg.get(SP),
                fp: m.reg.get(FP),
            },
            inbox_size: m.inbox.len(),
            outbox_size: m.outbox.len(),
            status,
        };

        Ok(to_value(&state)?)
    }

    pub fn read_code(&mut self, id: u16, size: u16) -> Return {
        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(NULL);
        };

        Ok(to_value(&m.mem.read_code(size))?)
    }

    pub fn read_mem(&mut self, id: u16, addr: u16, size: u16) -> Return {
        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(NULL);
        };

        Ok(to_value(&m.mem.read(addr, size))?)
    }

    pub fn read_stack(&mut self, id: u16, size: u16) -> Return {
        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(NULL);
        };

        Ok(to_value(&m.mem.read_stack(size))?)
    }

    /// Allows the frontend to consume events from the machine.
    pub fn consume_machine_side_effects(&mut self, id: u16) -> Return {
        Ok(to_value(&self.canvas.seq.consume_side_effects(id))?)
    }

    /// Allows the frontend to consume events from the blocks.
    pub fn consume_block_side_effects(&mut self) -> Return {
        Ok(to_value(&self.canvas.consume_block_side_effects())?)
    }

    pub fn set_machine_clock_speed(&mut self, cycle_per_tick: u16) {
        self.canvas.machine_cycle_per_tick = cycle_per_tick;
    }

    pub fn send_message(&mut self, message: Message) -> Return {
        returns(self.canvas.send_message_to_port(message))
    }

    pub fn send_message_to_block(&mut self, block_id: u16, action: Action) -> Return {
        returns(self.canvas.send_message_to_block(block_id, action))
    }

    pub fn update_built_in_block(&mut self, id: u16, data: InternalBlockData) -> Return {
        returns(self.canvas.update_built_in_block(id, data))
    }

    pub fn update_external_block(&mut self, id: u16, data: Vec<u8>) -> Return {
        returns(self.canvas.update_external_block(id, data))
    }

    pub fn reset_blocks(&mut self) -> Return {
        returns(self.canvas.reset_blocks())
    }

    pub fn reset_block(&mut self, id: u16) -> Return {
        returns(self.canvas.reset_block(id))
    }

    pub fn set_await_watchdog(&mut self, state: bool) {
        self.canvas.seq.await_watchdog = state;
    }

    pub fn clear(&mut self) {
        self.canvas = Canvas::new();
    }

    /// Serialize the entire canvas state - very slow!
    /// Should only be used for debugging.
    pub fn full_serialize_canvas_state(&self) -> Return {
        Ok(to_value(&self.canvas)?)
    }

    /// Serialize the canvas state, excluding the buffers.
    pub fn partial_serialize_canvas_state(&self) -> Return {
        let mut canvas = self.canvas.clone();

        for m in canvas.seq.machines.iter_mut() {
            m.inbox.clear();
            m.mem.buffer = vec![];
            m.reg.buffer = vec![];
        }

        for b in canvas.blocks.iter_mut() {
            b.inbox.clear();
            b.outbox.clear();
        }

        Ok(to_value(&canvas)?)
    }

    pub fn force_tick_block(&mut self, id: u16) -> Return {
        match self.canvas.route_messages() {
            Err(_) => return Ok(NULL),
            Ok(_) => {}
        };

        returns(self.canvas.tick_block(id))
    }

    /// Used to restore the counter's state.
    pub fn recompute_id_counters(&mut self) {
        self.canvas.recompute_id_counters();
    }

    pub fn add_wire_with_id(&mut self, id: u16, source: Port, target: Port) {
        self.canvas.wires.push(Wire { id, source, target });
    }

    pub fn set_mem(&mut self, id: u16, address: u16, data: Vec<u16>) -> Return {
        let Some(m) = self.canvas.seq.get_mut(id) else {
            return Ok(false.into());
        };

        m.mem.write(address, &data);
        Ok(true.into())
    }

    pub fn wake(&mut self, machine_id: u16) {
        self.canvas.seq.wake(machine_id);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_step() {}
}
