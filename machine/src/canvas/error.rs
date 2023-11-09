use serde::{Deserialize, Serialize};
use snafu::prelude::*;
use crate::canvas::wire::Port;

#[derive(Debug, Snafu, Serialize, Deserialize, PartialEq, Clone)]
#[snafu(visibility(pub))]
pub enum CanvasError {
    #[snafu(display("Cannot connect port {:?} to itself", port))]
    CannotWireToItself { port: Port },
}
