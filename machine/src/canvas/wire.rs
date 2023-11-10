use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash, Copy)]
pub struct Port {
    pub block: u16,
    pub port: u16,
}

impl Port {
    pub fn new(block: u16, port: u16) -> Port {
        Port { block, port }
    }
}

pub fn port(block: u16, port: u16) -> Port {
    Port { block, port }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Wire {
    pub id: u16,
    pub source: Port,
    pub target: Port,
}

impl Wire {
    pub fn connect(&mut self, block: u16, port: u16) {
        self.target = Port { block, port };
    }
}