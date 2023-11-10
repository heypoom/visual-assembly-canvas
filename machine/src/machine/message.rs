use serde::{Deserialize, Serialize};
use crate::canvas::wire::Port;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Message {
    /// Action sent to the machine.
    pub action: Action,

    /// Address of the sender block.
    pub port: Port,
}

/// Messages that can be sent between nodes and machines.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Action {
    /// Send information to the specified node.
    Data {
        body: Vec<u16>
    },
}

