pub mod status;
pub mod router_error;

use std::collections::HashMap;
use crate::{Actor, Event, Execute, Machine, Parser};

use status::MachineStatus;
use status::MachineStatus::{Awaiting, Halted, Running};

pub use router_error::RouterError::*;
pub use router_error::RouterError;

// Limit the max number of execution cycles to prevent an infinite loop.
const MAX_ITER: u16 = 1000;

type Errorable = Result<(), RouterError>;

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

    /// Run every machine until all halts.
    pub fn run(&mut self) -> Errorable {
        self.ready();

        for _ in 1..MAX_ITER {
            if self.is_halted() { break; }
            self.step()?;
        }

        Ok(())
    }

    /// Load the code and symbols into memory.
    pub fn load(&mut self, id: u16, source: &str) -> Errorable {
        let Some(m) = self.get_mut(id) else { return Err(MissingMachineId { id }); };

        m.reset();

        let parser: Result<Parser, _> = (*source).try_into();

        let parser = match parser {
            Ok(parser) => parser,
            Err(error) => return Err(CannotParse { error }),
        };

        m.mem.load_code(parser.ops);
        m.mem.load_symbols(parser.symbols);

        Ok(())
    }

    /// Mark the machines as ready for execution.
    pub fn ready(&mut self) {
        for m in &mut self.machines {
            let Some(id) = m.id else { continue; };
            m.reg.reset();
            self.statuses.insert(id, Running);
        }
    }

    /// Step once for all machines.
    pub fn step(&mut self) -> Errorable {
        self.route_messages();

        for m in &mut self.machines {
            let Some(id) = m.id else { continue; };
            let Some(status) = self.statuses.get(&id) else { continue; };
            if status == &Halted { continue; };

            if m.should_halt() {
                self.statuses.insert(id, Halted);
                continue;
            }

            // Before each instruction cycle, we collect and process the messages sequentially.
            if let Err(error) = m.receive_messages() {
                return Err(ReceiveFailed { error });
            };

            // Do not tick in await mode.
            if status == &Awaiting {
                if m.expected_receives > 0 {
                    println!("{}: i am awaiting for {} messages", id, m.expected_receives);
                    continue;
                } else {
                    self.statuses.insert(id, Running);
                }
            }

            // Execute the instruction.
            if let Err(error) = m.tick() {
                return Err(ExecutionFailed { id, error });
            };

            // Pause execution until subsequent cycles
            // if the machine is awaiting for messages.
            if m.expected_receives > 0 {
                self.statuses.insert(id, Awaiting);
            }
        }

        Ok(())
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
