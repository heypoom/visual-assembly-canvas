use std::sync::mpsc;
use std::sync::mpsc::{Sender, Receiver};
use crate::{Machine, Parser, Execute, MAPPED_START};
use crate::message::MessageEvent;

pub mod message;

pub struct Orchestrator {
    pub machines: Vec<Machine>,
    pub tx: Sender<MessageEvent>,
    pub rx: Receiver<MessageEvent>,
}

impl Orchestrator {
    pub fn new() -> Orchestrator {
        let (tx, rx) = mpsc::channel();

        Orchestrator {
            machines: vec![],
            tx,
            rx,
        }
    }

    pub fn add(&mut self) -> u16 {
        let mut m = Machine::new();
        let id = self.machine_id();
        m.id = Some(id);

        m.handlers.message.push({
            let tx = self.tx.clone();

            Box::new(move |m| {
                println!("on_message: {:?}", m);
                tx.clone().send(m).unwrap();
            })
        });

        self.machines.push(m);
        id
    }

    pub fn machine_id(&self) -> u16 {
        self.machines.len() as u16
    }

    pub fn run_code(&mut self, id: u16, code: &str) {
        let machine = &mut self.machines[id as usize];

        let parser: Parser = code.into();
        machine.mem.load_symbols(parser.symbols);
        machine.mem.load_code(parser.ops);
        machine.is_debug = true;
        machine.run();
    }

    pub fn read_message(&mut self) {
        let message = self.rx.recv().unwrap();

        match message {
            MessageEvent::Send { from, port, bytes } => {
                println!("broker#recv: from={} port={} bytes={:?}", from, port, bytes);

                // TODO: add the port mechanism to the machine.
                if let Some(m) = self.machines.get_mut(port as usize) {
                    let id = m.id.unwrap_or(0);

                    // The message landed on the wrong machine.
                    if id != port { return; }

                    println!("recv at {}: {:?}", id, bytes);
                    m.mem.write(MAPPED_START, &bytes);
                }
            }
            MessageEvent::MapMemory { .. } => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::Orchestrator;

    #[test]
    fn test_send_message() {
        let mut o = Orchestrator::new();

        let m1_id = o.add();
        o.add();

        o.run_code(m1_id, r"
            push 0xDE
            push 0xAD
            send 1 2
        ");

        o.read_message();
    }
}