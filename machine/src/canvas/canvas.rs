use serde::{Deserialize, Serialize};
use crate::{Sequencer};
use crate::audio::wavetable::Wavetable;
use super::blocks::{Block};
use super::error::{CanvasError};
use super::wire::{Wire};

pub type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
    pub seq: Sequencer,

    pub block_id_counter: u16,
    pub wire_id_counter: u16,

    /// How many cycles should the machine run per tick? i.e. their clock speed.
    pub machine_cycle_per_tick: u16,

    /// How many messages can the inbox hold before it starts dropping messages?
    pub inbox_limit: usize,

    /// Used for pre-computing waveforms for performance.
    #[serde(skip)]
    pub wavetable: Wavetable,
}

impl Canvas {
    pub fn new() -> Canvas {
        Canvas {
            blocks: vec![],
            wires: vec![],

            seq: Sequencer::new(),
            wavetable: Wavetable::new(),

            block_id_counter: 0,
            wire_id_counter: 0,

            inbox_limit: 100,
            machine_cycle_per_tick: 1,
        }
    }
}
