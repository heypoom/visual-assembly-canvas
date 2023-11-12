use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PixelMode {
    /// Replaces the content of the block with the given byte.
    Replace,

    /// Append the pixel to the block. Byte zero deletes one pixel.
    Append,

    /// Send command packets to alter the block.
    Command,
}