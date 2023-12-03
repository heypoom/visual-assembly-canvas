use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Event, Message};
use crate::audio::synth::note_to_freq;
use crate::audio::synth::SynthTrigger::AttackRelease;
use crate::canvas::blocks::BlockData::Synth;

impl Canvas {
    pub fn tick_synth_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in &messages {
            match &message.action {
                Action::Data { body } => {
                    // Collect the synth inputs into trigger events.
                    let mut triggers = vec![];

                    for c in body.chunks(2) {
                        let [note, time] = c else { continue; };

                        triggers.push(AttackRelease {
                            freq: note_to_freq(*note as u8),
                            duration: (*time as f32) / 255f32,
                            time: 0.0,
                        });
                    }

                    let block = self.mut_block(id)?;

                    if let Synth { .. } = &block.data {
                        block.events.push(Event::Synth {
                            triggers,
                        })
                    }
                }

                Action::Write { address, data } => {
                    let block = self.mut_block(id)?;

                    let Synth { .. } = block.data else { continue; };

                    let mut triggers = vec![];
                    let duration = *address + 1;

                    for note in data {
                        triggers.push(AttackRelease {
                            freq: note_to_freq(*note as u8),
                            duration: (duration as f32) / 255f32,
                            time: 0.0,
                        });
                    }

                    block.events.push(Event::Synth { triggers })
                }

                _ => {}
            }
        }

        Ok(())
    }
}