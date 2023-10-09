use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;
use machine::{Event, Execute, Machine, Parser};

const NULL: JsValue = JsValue::NULL;

#[wasm_bindgen]
pub struct Controller {
    #[wasm_bindgen(skip)]
    pub machines: Vec<Machine>
}

#[derive(Serialize, Deserialize)]
pub struct RunResult {
    pub stack: Vec<u16>,
    pub events: Vec<Event>
}

type Return = Result<JsValue, JsValue>;

#[wasm_bindgen]
impl Controller {
    pub fn create() -> Controller {
        Controller {
            machines: vec![]
        }
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

    pub fn run(&mut self, id: u16, source: &str) -> Return {
        let Some(m) = self.get_mut(id) else { return Ok(NULL) };

        // Reset the memory and registers to avoid faulty state.
        m.reg.reset();
        m.mem.reset();

        // Load the code and symbols into memory.
        let parser: Parser = source.into();
        m.mem.load_code(parser.ops);
        m.mem.load_symbols(parser.symbols);
        m.run();

        // Return the stack and events.
        let stack = m.mem.read_stack(10);
        let events = m.events.clone();
        let result = RunResult { stack, events };

        Ok(to_value(&result)?)
    }

    pub fn read(&self, id: u16, addr: u16, count: u16) -> Return {
        let Some(m) = self.get(id) else { return Ok(NULL) };

        let stack = m.mem.read(addr, count);
        Ok(to_value(&stack)?)
    }

    pub fn read_stack(&self, id: u16, size: u16) -> Return {
        let Some(m) = self.get(id) else { return Ok(NULL) };

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

    pub fn tick(&mut self) {
        let mut messages = vec![];

        // Collect messages from send events.
        for m in &mut self.machines {
            let Some(event) = m.events.pop() else {continue};

            if let Event::Send {message} = event {
                messages.push(message);
            }
        }

        // Send messages to machines.
        for message in messages {
            let Some(dst) = self.get_mut(message.to) else { return };

            dst.mailbox.push(message);
        }

        // TODO: process mailboxes.
    }
}
