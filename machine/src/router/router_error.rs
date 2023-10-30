use serde::{Deserialize, Serialize};
use snafu::prelude::*;
use crate::{ParseError, RuntimeError};

#[derive(Debug, Snafu, Serialize, Deserialize)]
#[snafu(visibility(pub))]
pub enum RouterError {
    #[snafu(display("cannot parse the code"))]
    CannotParse { error: ParseError },

    #[snafu(display("program execution results in an error"))]
    ExecutionFailed { error: RuntimeError },

    #[snafu(display("the machine with id of {id} does not exist"))]
    MissingMachineId { id: u16 },

    #[snafu(display("program failed to process the incoming message"))]
    ReceiveFailed { error: RuntimeError },
}

