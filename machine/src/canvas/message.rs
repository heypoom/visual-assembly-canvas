use crate::audio::midi::MidiInputEvent;
use crate::canvas::wire::Port;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Message {
    /// Action sent to the machine.
    pub action: Action,

    /// Address of the sender block.
    pub sender: Port,

    /// Address of the recipient block.
    /// If none, the message is sent to the devices connected to the sender port.
    pub recipient: Option<u16>,
}

/// Messages that can be sent between nodes and machines.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum Action {
    /// Send information to the specified node.
    Data { body: Vec<u16> },

    /// Request to read from the specified address.
    Read { address: u16, count: u16 },

    /// Write to the specified address.
    Write { address: u16, data: Vec<u16> },

    /// Override all existing data.
    Override { data: Vec<u16> },

    /// Reset the node to its initial state.
    Reset,

    /// Send an empty ping packet. Mostly used for timing to control the machine frequency.
    Ping,

    /// Notify the block that a MIDI message has been received.
    Midi {
        event: MidiInputEvent,
        note: u8,
        value: u8,
        channel: u8,
        port: u8,
    },
}
