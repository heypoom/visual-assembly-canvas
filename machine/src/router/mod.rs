use std::collections::HashMap;
use crate::{Event, Execute, Machine, Parser};
use crate::router::status::MachineStatus;
use crate::router::status::MachineStatus::{Halted, Running};

mod status;

pub struct Router {
    pub machines: Vec<Machine>,

    /// Stores the statuses of the machine.
    pub statuses: HashMap<u16, MachineStatus>,
}

impl Router {
    pub fn new() -> Router {
        Router {
            machines: vec![],
            statuses: HashMap::new(),
        }
    }

    /// Add a machine.
    pub fn add(&mut self) -> u16 {
        let mut m = Machine::new();

        // Assign a machine identifier.
        let id = self.machines.len() as u16;
        m.id = Some(id);

        self.machines.push(m);
        id
    }

    /// Start the machine.
    pub fn begin(&mut self) {
        for m in &mut self.machines {
            let Some(id) = m.id else { continue; };
            m.reset();
            self.statuses.insert(id, Running);
        }
    }

    /// Load the code and symbols into memory.
    pub fn load(&mut self, id: u16, source: &str) {
        let Some(m) = self.get_mut(id) else { return; };

        let parser: Parser = source.into();
        m.mem.load_code(parser.ops);
        m.mem.load_symbols(parser.symbols);
    }


    /// Step once for all machines.
    pub fn step(&mut self) {
        self.route_messages();

        for m in &mut self.machines {
            let Some(id) = m.id else { continue; };
            if self.statuses.get(&id) == Some(&Halted) { continue; };

            if m.should_halt() {
                self.statuses.insert(id, Halted);
                continue;
            }

            m.tick()
        }
    }

    pub fn is_halted(&self) -> bool {
        self.statuses.values().all(|s| s == &Halted)
    }

    pub fn get(&self, id: u16) -> Option<&Machine> {
        self.machines.iter().find(|m| m.id == Some(id))
    }

    pub fn get_mut(&mut self, id: u16) -> Option<&mut Machine> {
        self.machines.iter_mut().find(|m| m.id == Some(id))
    }

    /// Route the messages to the appropriate machines.
    /// Scans the machine's event queue for Send events,
    /// then push the messages to destination's mailbox.
    fn route_messages(&mut self) {
        let mut messages = vec![];

        // Process "send" events from the machines until the queue is empty.
        for m in &mut self.machines {
            // These events are "side effects" that will be processed
            // later in the client, such as in JavaScript side.
            let mut side_effects = vec![];

            while !m.events.is_empty() {
                let Some(event) = m.events.pop() else { break; };

                match event {
                    // Collect messages from each machine.
                    Event::Send { message } => messages.push(message),
                    _ => side_effects.push(event),
                }
            }

            m.events = side_effects;
        }

        // Push messages to machines' mailbox.
        for message in messages {
            if let Some(dst) = self.get_mut(message.to) {
                dst.mailbox.push(message);
            };
        }
    }
}

