use crate::canvas::canvas::Errorable;
use crate::canvas::Canvas;
use crate::canvas::CanvasError::MachineError;
use crate::Event;
use std::collections::HashMap;

impl Canvas {
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
                self.seq
                    .step(self.machine_cycle_per_tick)
                    .map_err(|cause| MachineError {
                        cause: cause.clone(),
                    })?;
            }
        }

        Ok(())
    }

    /// Run every machine until all halts.
    pub fn run(&mut self) -> Errorable {
        self.seq.ready();

        for _ in 1..1000 {
            if self.seq.is_halted() {
                break;
            }
            self.tick(1)?;
        }

        self.tick(1)?;

        Ok(())
    }

    /// Load the source program in Assembly to the machine.
    pub fn load_program(&mut self, id: u16, source: &str) -> Errorable {
        self.seq
            .load(id, source)
            .map_err(|cause| MachineError { cause })
    }

    /// Consume the side effect events in the frontend.
    pub fn consume_block_side_effects(&mut self) -> HashMap<u16, Vec<Event>> {
        let mut effects = HashMap::new();

        for block in &mut self.blocks {
            effects.insert(block.id, block.events.drain(..).collect());
        }

        effects
    }
}
