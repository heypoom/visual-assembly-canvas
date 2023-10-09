use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Message {
    /// Action sent to the machine.
    pub action: Action,

    /// Address of the sender.
    pub from: u16,

    /// Address of the receiver.
    pub to: u16,
}

/// Messages that can be sent between nodes and machines.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Action {
    /// Send information to the specified node.
    Data {
        body: Vec<u16>
    },
}

