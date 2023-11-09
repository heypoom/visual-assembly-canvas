use serde::{Deserialize, Serialize};
use snafu::prelude::*;
use crate::{ParseError, RuntimeError};

#[derive(Debug, Snafu, Serialize, Deserialize, PartialEq, Clone)]
#[snafu(visibility(pub))]
pub enum RouterError {
    #[snafu(display("cannot parse the code"))]
    CannotParse { id: u16, error: ParseError },

    #[snafu(display("program execution for machine {id} results in an error"))]
    ExecutionFailed { id: u16, error: RuntimeError },

    #[snafu(display("the machine with id of {id} does not exist"))]
    MachineDoesNotExist { id: u16 },

    #[snafu(display("program failed to process the incoming message"))]
    ReceiveFailed { error: RuntimeError },

    #[snafu(display("program expects a message but they are never received"))]
    MessageNeverReceived { id: u16 },

}

