use std::sync::mpsc;
use std::sync::mpsc::{Sender, Receiver};
use crate::{Machine, Parser, Execute, Message};

pub struct Orchestrator {
    pub machines: Vec<Machine>,
    pub tx: Sender<Message>,
    pub rx: Receiver<Message>,
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

        {
            let tx = self.tx.clone();

            m.handlers.message = Some(Box::new(move |m| {
                tx.clone().send(m).unwrap();
            }));
        };

        self.machines.push(m);
        id
    }

    pub fn machine_id(&self) -> u16 {
        self.machines.len() as u16
    }

    pub fn get(&mut self, id: u16) -> &mut Machine {
        self.machines.get_mut(id as usize).expect("cannot get machine")
    }

    pub fn run_code(&mut self, id: u16, code: &str) {
        let machine = &mut self.machines[id as usize];

        let parser: Parser = code.into();
        machine.mem.load_symbols(parser.symbols);
        machine.mem.load_code(parser.ops);
        machine.run();
    }

    pub fn read_message(&mut self) {
        let message = self.rx.recv().unwrap();

        if let Some(m) = self.machines.get_mut(message.to as usize) {
            m.mailbox.push(message);
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::{Message, Orchestrator};
    use crate::Action::Data;

    #[test]
    fn test_send_message() {
        let mut o = Orchestrator::new();

        let m1_id = o.add();
        let m2_id = o.add();

        // Send two messages from 1 to 2.
        o.run_code(m1_id, r"
            push 0xDEAD
            push 0xBEEF
            send 0x01 0x02

            push 0b1100
            push 0b1010
            send 0x01 0x02
        ");

        // First message is received.
        o.read_message();
        let m2 = o.get(m2_id);

        // The mailbox should contain one message.
        assert_eq!(m2.mailbox.len(), 1);

        // Second message is received.
        o.read_message();

        // The mailbox should contain two messages.
        let m2 = o.get(m2_id);
        assert_eq!(m2.mailbox, [
            Message { action: Data { body: vec![0xBEEF, 0xDEAD] }, from: 0, to: 1 },
            Message { action: Data { body: vec![0b1010, 0b1100] }, from: 0, to: 1 }
        ]);

        // Machine 2 should read the message.
        o.run_code(m2_id, r"receive");

        // The mailbox should now have only one message.
        let m2 = o.get(m2_id);
        assert_eq!(m2.mailbox.len(), 1);
        assert_eq!(m2.mem.read_stack(2), [0b1010, 0b1100]);

        // Machine 2 should read the message again.
        o.run_code(m2_id, r"pop
        pop
        receive");

        // The mailbox should now have zero message.
        let m2 = o.get(m2_id);
        assert_eq!(m2.mailbox, []);
        assert_eq!(m2.mem.read_stack(2), [0xBEEF, 0xDEAD]);
    }
}