use serde::{Deserialize, Serialize};
use strum_macros::EnumIs;
use tsify::Tsify;

/// How do we visualize a set of values?
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, EnumIs, Tsify)]
#[serde(tag = "type")]
#[tsify(into_wasm_abi, from_wasm_abi, namespace)]
pub enum ValueVisualType {
    /// Series of on-off switches.
    Switches {
        /// Which bits to visualize? (e.g. {1, 8, 14} shows 3 switches)
        /// If empty, shows all 16 bits as 16 switches (for u16)
        bits: Vec<u16>
    },

    /// Visualize the byte(s) as a black-white colored grid.
    ColorGrid,

    /// Display as integer(s).
    Int,

    /// Shows a string.
    /// The string are always null-terminated C-strings.
    String,

    /// Visualize the bytes as memory region grids.
    Bytes,
}