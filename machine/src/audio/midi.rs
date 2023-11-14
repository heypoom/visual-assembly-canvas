use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub enum MidiEvent {
    NoteOn,
    NoteOff,
    ControlChange,
}

#[wasm_bindgen]
pub enum MidiOutMode {
    Note,
    Launchpad,
}