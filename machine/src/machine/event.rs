/// Machine's event. Can be considered a side effect.
#[derive(Clone, Debug, PartialEq)]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },
}

