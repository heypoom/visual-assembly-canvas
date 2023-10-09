use serde::{Deserialize, Serialize};
use crate::Message;

/// Machine's event. Can be considered a side effect.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },

    /// Send a message to another machine.
    Send {
        message: Message
    }
}

