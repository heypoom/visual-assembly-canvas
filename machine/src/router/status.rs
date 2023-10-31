use serde::{Deserialize, Serialize};

/// The machine status models the possible states of a machine.
#[derive(Debug, Serialize, Deserialize, PartialEq, Copy, Clone)]
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
}