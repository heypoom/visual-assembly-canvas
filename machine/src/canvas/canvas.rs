use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::canvas::error::CanvasError::{MachineError};
use crate::{Event, Sequencer};
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

    pub fn tick(&mut self, count: u16) -> Errorable {
        let ids: Vec<u16> = self.blocks.iter().map(|b| b.id).collect();

        for _ in 0..count {
            // Collect the messages, and route them to their destination blocks.
            self.route_messages()?;

            // Tick each block.
            for id in ids.clone() {
                self.tick_block(id)?
            }

            // Tick the machine sequencer.
            if !self.seq.is_halted() {
                self.seq.step(self.machine_cycle_per_tick)
                    .map_err(|cause| MachineError { cause: cause.clone() })?;
            }
        }

        Ok(())
    }

    /// Run every machine until all halts.
    pub fn run(&mut self) -> Errorable {
        self.seq.ready();

        for _ in 1..1000 {
            if self.seq.is_halted() { break; }
            self.tick(1)?;
        }

        self.tick(1)?;

        Ok(())
    }

    /// Load the source program in Assembly to the machine.
    pub fn load_program(&mut self, id: u16, source: &str) -> Errorable {
        self.seq.load(id, source).map_err(|cause| MachineError { cause })
    }

    /// Disable the await watchdog if we know the message will eventually arrive.
    pub fn set_await_watchdog(&mut self, enabled: bool) {
        self.seq.await_watchdog = enabled;
    }

    /// Consume the side effect events in the frontend.
    pub fn consume_block_side_effects(&mut self) -> HashMap<u16, Vec<Event>> {
        let mut effects = HashMap::new();

        for block in &mut self.blocks {
            effects.insert(block.id, block.events.drain(..).collect());
        }

        effects
    }

    /// When we import existing blocks and wires to the canvas, we must recompute the id counter.
    pub fn recompute_id_counters(&mut self) {
        self.wire_id_counter = self.wires.iter().map(|x| x.id).max().unwrap_or(0) + 1;
        self.block_id_counter = self.blocks.iter().map(|x| x.id).max().unwrap_or(0) + 1;
    }

    /// Set the machine's clock speed, in cycles per tick.
    pub fn set_machine_clock_speed(&mut self, cycle_per_tick: u16) {
        self.machine_cycle_per_tick = cycle_per_tick;
    }
}


