use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::blocks::BlockData::MidiIn;

impl Canvas {
    pub fn tick_midi_in_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Midi { event, value, note, channel: ch, port: p } => {
                    if let MidiIn { on, channels, port, .. } = &self.get_block(id)?.data {
                        if *on != event || *port != (p as u16) { continue; }

                        // Enable channel filtering if channels are defined.
                        if channels.len() > 0 && !channels.contains(&(ch as u16)) { continue; }
                    }

                    self.send_data_to_sinks(id, vec![note as u16, value as u16])?;
                }

                Action::SetMidiPort { port: p } => {
                    if let MidiIn { port, .. } = &mut self.mut_block(id)?.data {
                        *port = p;
                    }
                }

                Action::SetMidiInputEvent { event } => {
                    if let MidiIn { on, .. } = &mut self.mut_block(id)?.data {
                        *on = event;
                    }
                }

                Action::SetMidiChannels { channels: chan } => {
                    if let MidiIn { channels, .. } = &mut self.mut_block(id)?.data {
                        *channels = chan;
                    }
                }

                _ => {}
            }
        }

        Ok(())
    }
}