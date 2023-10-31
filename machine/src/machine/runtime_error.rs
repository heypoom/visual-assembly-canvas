use serde::{Deserialize, Serialize};
use snafu::prelude::*;

#[derive(Debug, Snafu, Serialize, Deserialize, PartialEq, Clone)]
#[snafu(visibility(pub))]
pub enum RuntimeError {
    #[snafu(display("stack underflow. pointer {top} is below {min}"))]
    StackUnderflow {
        top: u16,
        min: u16,
    },

    #[snafu(display("stack overflow. pointer {top} is above {max}"))]
    StackOverflow {
        top: u16,
        max: u16,
    },

    #[snafu(display("call stack exceeded"))]
    CallStackExceeded,

    #[snafu(display("missing return address"))]
    MissingReturnAddress,

    #[snafu(display("message body does not exist in stack"))]
    MissingMessageBody,

    #[snafu(display("unable to convert sequences of bytes to string"))]
    CannotReadStringFromBytes,

    #[snafu(display("cannot load data from memory"))]
    CannotLoadFromMemory,

    #[snafu(display("cannot divide by zero"))]
    CannotDivideByZero,

    #[snafu(display("integer overflow"))]
    IntegerOverflow,

    #[snafu(display("integer underflow"))]
    IntegerUnderflow,

    #[snafu(display("missing value to store"))]
    MissingValueToStore,
}
