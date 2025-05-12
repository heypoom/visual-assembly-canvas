use crate::blocks::InternalBlockData::MidiIn;
use crate::canvas::canvas::Errorable;
use crate::canvas::Canvas;
use crate::{Action, Message};

impl Canvas {
    pub fn tick_midi_in_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Midi {
                    event,
                    value,
                    note,
                    channel: ch,
                    port: p,
                } => {
                    if let MidiIn {
                        on, channels, port, ..
                    } = self.mut_built_in_data_by_id(id)?
                    {
                        if *on != event || *port != (p as u16) {
                            continue;
                        }

                        // Enable channel filtering if channels are defined.
                        if channels.len() > 0 && !channels.contains(&(ch as u16)) {
                            continue;
                        }
                    }

                    self.send_data_to_sinks(id, vec![note as u16, value as u16])?;
                }

                _ => {}
            }
        }

        Ok(())
    }
}
