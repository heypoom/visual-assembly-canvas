use serde::{Deserialize, Serialize};

/// The machine status models the possible states of a machine.
#[derive(Debug, Serialize, Deserialize, PartialEq, Copy, Clone)]
pub enum MachineStatus {
    /// Machine is running.
    Running,

    /// Machine is awaiting a message.
    Awaiting,

    /// Machine has reached the end of execution.
    Halted,
}