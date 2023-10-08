#[derive(Debug, Clone)]
pub enum MessageEvent {
    /// Send a message to the specified port.
    Send {
        from: u16,
        to: u16,
        bytes: Vec<u16>,
    },

    /// Assign the memory region between (start, start + size) at the specified port.
    MapMemory {
        from: u16,
        to: u16,
        start: u16,
        size: u16,
    },
}