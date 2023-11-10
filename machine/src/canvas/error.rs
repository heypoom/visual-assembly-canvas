use serde::{Deserialize, Serialize};
use snafu::prelude::*;
use crate::canvas::wire::Port;
use crate::SequencerError;

#[derive(Debug, Snafu, Serialize, Deserialize, PartialEq, Clone)]
#[snafu(visibility(pub))]
pub enum CanvasError {
    #[snafu(display("Cannot connect port {:?} to itself", port))]
    CannotWireToItself { port: Port },

    #[snafu(display("Cannot find block {id}"))]
    BlockNotFound { id: u16 },
    
    #[snafu(display("Cannot find machine {id}"))]
    MachineNotFound { id: u16 },

    MachineError { cause: SequencerError },

    DisconnectedPort { port: Port },
}
