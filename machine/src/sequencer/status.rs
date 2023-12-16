use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::wasm_bindgen;

/// The machine status models the possible states of a machine.
#[derive(Debug, Serialize, Deserialize, PartialEq, Copy, Clone, Tsify)]
pub enum MachineStatus {
    /// Current program does not parse.
    Invalid,

    /// Program is verified and loaded into memory.
    Loaded,

    /// Machine's state is reset.
    /// We may reuse the machine without reloading the program.
    Ready,

    /// Machine is running.
    Running,

    /// Machine is awaiting a message.
    Awaiting,

    /// Machine has reached the end of execution.
    Halted,

    /// Machine has produced a runtime error.
    Errored,
}