#[derive(Debug, Clone)]
pub enum Message {
    /// Send a data packet to the specified port.
    Data {
        body: Vec<u16>
    },

    /// Send a data packet requesting to map the memory of the specified port.
    MapMemory {
        start: u16,
        size: u16,
    },
}

#[derive(Debug, Clone)]
pub struct Packet {
    pub from: u16,
    pub to: u16,
    pub message: Message,
}