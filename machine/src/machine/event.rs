use serde::{Deserialize, Serialize};

/// Machine's event. Can be considered a side effect.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },
}

