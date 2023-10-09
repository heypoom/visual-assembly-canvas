/// Machine's event. Can be considered a side effect.
#[derive(Clone, Debug)]
pub enum Event {
    /// Print texts to screen.
    Print {
        text: String
    },
}

