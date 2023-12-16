use serde::{Deserialize, Serialize};
use snafu::prelude::*;
use tsify::Tsify;
use crate::canvas::wire::Port;
use crate::{Message, SequencerError};

#[derive(Debug, Snafu, Serialize, Deserialize, PartialEq, Clone, Tsify)]
#[snafu(visibility(pub))]
#[serde(tag = "type")]
pub enum CanvasError {
    #[snafu(display("Cannot connect port {:?} to itself", port))]
    CannotWireToItself { port: Port },

    #[snafu(display("Cannot find block {id}"))]
    BlockNotFound { id: u16 },

    #[snafu(display("Cannot find machine {id}"))]
    MachineNotFound { id: u16 },

    MachineError { cause: SequencerError },

    DisconnectedPort { port: Port },

    CannotFindWire { src: Port, dst: Port },

    #[snafu(display("block id {id} is already in use"))]
    BlockIdInUse { id: u16 },

    MissingMessageRecipient { message: Message },
}
