#[derive(Debug, Clone)]
pub enum MessageEvent {
    /// Send a message to the specified port.
    Send {
        port: u16,
        bytes: Vec<u16>,
    },

    /// Assign the memory region between (start, start + size) at the specified port.
    MapMemory {
        port: u16,
        start: u16,
        size: u16,
    },
}