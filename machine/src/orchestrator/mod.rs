use crate::{Machine, Parser, Execute};

pub mod message;

pub struct Orchestrator {
    pub machines: Vec<Machine>,
}

impl Orchestrator {
    pub fn new() -> Orchestrator {
        Orchestrator {
            machines: vec![],
        }
    }

    pub fn add(&mut self) -> usize {
        let mut m = Machine::new();

        m.handlers.message.push(Box::new(|s| {
            println!("Message: {:?}", s);
        }));

        self.machines.push(m);
        self.machines.len() - 1
    }

    pub fn run_code(&mut self, id: usize, code: &str) {
        let machine = &mut self.machines[id];

        let parser: Parser = code.into();
        machine.mem.load_symbols(parser.symbols);
        machine.mem.load_code(parser.ops);
        machine.is_debug = true;
        machine.run();
    }
}

#[cfg(test)]
mod tests {
    use crate::Orchestrator;

    #[test]
    fn test_send_message() {
        let mut o = Orchestrator::new();

        let m1_id = o.add();
        o.run_code(m1_id, r"
            push 0xDE
            push 0xAD
            send 1 2
        ");
    }
}