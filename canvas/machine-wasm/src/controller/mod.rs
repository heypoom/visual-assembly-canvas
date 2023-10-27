use machine::{Event, Execute, Machine, Parser};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

const NULL: JsValue = JsValue::NULL;

#[wasm_bindgen]
pub struct Controller {
    #[wasm_bindgen(skip)]
    pub machines: Vec<Machine>,
}

#[derive(Serialize, Deserialize)]
pub struct RunResult {
    pub stack: Vec<u16>,
    pub events: Vec<Event>,
}

type Return = Result<JsValue, JsValue>;

#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller { machines: vec![] }
    }

    pub fn add(&mut self) -> u16 {
        let mut m = Machine::new();
        let id = self.id();
        m.id = Some(id);
        self.machines.push(m);
        id
    }

    pub fn id(&self) -> u16 {
        self.machines.len() as u16
    }

    fn get_mut(&mut self, id: u16) -> Option<&mut Machine> {
        self.machines.get_mut(id as usize)
    }

    fn get(&self, id: u16) -> Option<&Machine> {
        self.machines.get(id as usize)
    }

    pub fn load(&mut self, id: u16, source: &str) {
        let Some(m) = self.get_mut(id) else { return };

        // Reset the memory and registers to avoid faulty state.
        m.reg.reset();
        m.mem.reset();

        // Load the code and symbols into memory.
        let parser: Parser = source.into();
        m.mem.load_code(parser.ops);
        m.mem.load_symbols(parser.symbols);
    }

    pub fn run(&mut self, id: u16, source: &str) -> Return {
        self.update();
        self.load(id, source);

        let Some(m) = self.get_mut(id) else {
            return Ok(NULL);
        };
        m.run();

        // Return the stack and events.
        let stack = m.mem.read_stack(10);
        let events = m.events.clone();
        let result = RunResult { stack, events };

        Ok(to_value(&result)?)
    }

    pub fn read(&self, id: u16, addr: u16, count: u16) -> Return {
        let Some(m) = self.get(id) else {
            return Ok(NULL);
        };

        let stack = m.mem.read(addr, count);
        Ok(to_value(&stack)?)
    }

    pub fn read_stack(&self, id: u16, size: u16) -> Return {
        let Some(m) = self.get(id) else {
            return Ok(NULL);
        };

        let stack = m.mem.read_stack(size);
        Ok(to_value(&stack)?)
    }

    pub fn read_mail(&self, id: u16) -> JsValue {
        let Some(m) = self.get(id) else { return NULL };

        // Return the mailbox.
        to_value(&m.mailbox).unwrap_or(NULL)
    }

    pub fn read_events(&self, id: u16) -> JsValue {
        let Some(m) = self.get(id) else { return NULL };

        // Return the events.
        to_value(&m.events).unwrap_or(NULL)
    }

    pub fn update(&mut self) {
        let mut messages = vec![];

        // Process events from the machines until the queue is empty.
        for m in &mut self.machines {
            // These events will be processed later.
            let mut pending = vec![];

            while m.events.len() > 0 {
                let Some(event) = m.events.pop() else { break };

                match event {
                    Event::Send { message } => messages.push(message),
                    _ => pending.push(event),
                }
            }

            m.events = pending;
        }

        // Send messages to machines.
        for message in messages {
            if let Some(dst) = self.get_mut(message.to) {
                dst.mailbox.push(message);
            };
        }
    }

    pub fn step(&mut self, id: u16) {
        let Some(m) = self.get_mut(id) else { return };
        m.tick();
    }

    pub fn reset(&mut self, id: u16) {
        let Some(m) = self.get_mut(id) else { return };
        m.reg.reset();
    }

    pub fn step_all(&mut self) {
        for m in &mut self.machines {
            m.tick();
        }
    }

    pub fn reset_all(&mut self) {
        for m in &mut self.machines {
            m.reg.reset();
        }
    }
}
