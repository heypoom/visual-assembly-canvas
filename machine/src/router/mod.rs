pub mod status;
pub mod router_error;

use std::collections::HashMap;
use crate::{Actor, Event, Execute, Machine, Parser};

use status::MachineStatus;
use status::MachineStatus::{Awaiting, Halted, Running};

pub use router_error::RouterError::*;
pub use router_error::RouterError;
use crate::status::MachineStatus::{Errored, Invalid, Loaded, Ready};

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
        let mut machine = Machine::new();

        // Assign a machine identifier.
        let id = self.machines.len() as u16;
        machine.id = Some(id);

        self.machines.push(machine);
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
        let machine = self.get_mut(id).ok_or(MissingMachineId { id })?;
        machine.full_reset();

        let parser: Result<Parser, _> = (*source).try_into();

        let parser = match parser {
            Ok(parser) => parser,
            Err(error) => {
                self.statuses.insert(id, Invalid);
                return Err(CannotParse { id, error });
            }
        };

        machine.mem.load_code(parser.ops);
        machine.mem.load_symbols(parser.symbols);

        self.statuses.insert(id, Loaded);

        Ok(())
    }

    /// Mark the machines as ready for execution.
    pub fn ready(&mut self) {
        for machine in &mut self.machines {
            let Some(id) = machine.id else { continue; };

            // Do not reset the machine if it is invalid.
            if self.statuses.get(&id) == Some(&Invalid) { continue; }
            machine.partial_reset();

            self.statuses.insert(id, Ready);
        }
    }

    /// Step once for all machines.
    pub fn step(&mut self) -> Errorable {
        self.route_messages();

        for machine in &mut self.machines {
            let Some(id) = machine.id else { continue; };
            let Some(status) = self.statuses.get(&id) else { continue; };
            let status = status.clone();

            // Manage state transitions of the machine.
            match status {
                Halted | Invalid | Loaded | Errored => continue,
                Ready => { self.statuses.insert(id, Running); }
                _ => {}
            }

            // Before each instruction cycle, we collect and process the messages sequentially.
            machine.receive_messages().map_err(|error| ReceiveFailed { error: error.into() })?;

            // Do not tick if the machine is still awaiting for messages.
            if status == Awaiting {
                if machine.expected_receives > 0 { continue; }

                // If it's the last instruction, we halt the machine as the message is received.
                if machine.should_halt() {
                    self.statuses.insert(id, Halted);
                    continue;
                }

                self.statuses.insert(id, Running);
            }

            // Execute the instruction.
            machine.tick().map_err(|error| {
                self.statuses.insert(id, Errored);
                ExecutionFailed { id, error: error.into() }
            })?;

            // Pause execution until subsequent cycles
            // if the machine is awaiting for messages.
            if machine.expected_receives > 0 {
                // Ensure that there is at least one machine that might send a message.
                let running = self.statuses.iter().filter(|(m_id, status)| id != **m_id && status == &&Running).count();
                if running == 0 {
                    self.statuses.insert(id, Errored);
                    return Err(MessageNeverReceived { id });
                }

                self.statuses.insert(id, Awaiting);
                continue;
            }

            // Halt the machine if we reached the end of the program.
            if machine.should_halt() {
                self.statuses.insert(id, Halted);
            }
        }

        Ok(())
    }

    pub fn is_halted(&self) -> bool {
        self.statuses.values().all(|s| s == &Halted || s == &Invalid || s == &Errored)
    }

    pub fn get_statuses(&self) -> HashMap<u16, MachineStatus> {
        self.statuses.clone()
    }

    pub fn get(&self, id: u16) -> Option<&Machine> {
        self.machines.iter().find(|m| m.id == Some(id))
    }

    pub fn get_mut(&mut self, id: u16) -> Option<&mut Machine> {
        self.machines.iter_mut().find(|m| m.id == Some(id))
    }

    /// Route the messages to the appropriate machines.
    fn route_messages(&mut self) {
        let messages: Vec<_> = self.machines.iter_mut().flat_map(|machine| machine.outbox.drain(..)).collect();

        for message in messages {
            if let Some(dst) = self.get_mut(message.to) {
                dst.inbox.push(message);
            }
        }
    }

    /// Consume the side effect events in the frontend.
    pub fn consume_side_effects(&mut self, id: u16) -> Vec<Event> {
        let Some(machine) = self.get_mut(id) else { return vec![]; };

        machine.events.drain(..).collect()
    }
}
