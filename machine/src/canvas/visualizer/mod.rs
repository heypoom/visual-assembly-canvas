pub enum VisualizerType {
    /// on-off switches
    Boolean,
    Number,
    String,
    ByteView,
    ByteGrid,
}

pub enum VisualizerMode {
    /// Acts as a display block that allows value to be written to.
    /// Use the send() operation.
    Write,

    /// Read values directly from the machine.
    /// note: should be able to use non-standard "debug" ports?
    /// so it does not clutter up the main ports...
    Inspector,

    /// Read values directly from the "wires" connecting machines together.
    /// Wires does not typically have "ports" unlike blocks, so we might need a different mechanism?
    Wiretap {
        wire_id: u16,
    },
}