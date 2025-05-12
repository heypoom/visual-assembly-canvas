use crate::blocks::InternalBlockData::MidiOut;
use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Event, Message};
use crate::audio::midi::MidiOutputFormat;

struct ObjectMessageProcessResult {
    /// Messages to send to the outlets.
    pub out_messages: Vec<Message>,

    /// Side effects to send to the host platform to perform.
    pub out_effects: Vec<Event>,
    
    /// Public state of the object.
    pub state: Vec<u8>
}

trait Plugin {
    fn init_module() -> ();
    fn create_object(id: u64);
    fn destroy_object(id: u64);
    fn process_object_messages(object_id: u64, messages: Vec<Message>) -> ObjectMessageProcessResult;
}

impl Canvas {
    pub fn tick_midi_out_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;

        let MidiOut { format, channel, port } = &mut block.data else {
            return Ok(());
        };

        for message in messages {
            match message.action {
                Action::Data { body } => {
                    // MIDI channels and ports cannot be over 255.
                    if *channel > 255 || *port > 255 { continue; }

                    let mut data: Vec<u8> = body.iter().map(|v| *v as u8).collect();

                    match *format {
                        // Limit the note and control change bytes to 0 - 127.
                        MidiOutputFormat::Note | MidiOutputFormat::ControlChange => {
                            data = data.iter().map(|d| d % 128).collect();
                        }

                        // Reverse the data bytes to make it easier to process.
                        MidiOutputFormat::Raw | MidiOutputFormat::Launchpad => data.reverse(),
                    }

                    block.events.push(Event::Midi {
                        format: *format,
                        data,
                        channel: (*channel) as u8,
                        port: (*port) as u8,
                    })
                }

                Action::Write { address, data } => {
                    // MIDI channels and ports cannot be over 255.
                    if *channel > 255 || *port > 255 { continue; }

                    let batch_register = 0x80;

                    match *format {
                        MidiOutputFormat::Note | MidiOutputFormat::ControlChange => {
                            // Writing below the batch register will send the data as a single note.
                            if address < batch_register {
                                let [velocity] = data[..] else { continue; };

                                block.events.push(Event::Midi {
                                    format: *format,
                                    data: vec![address as u8, (velocity % 128) as u8],
                                    channel: (*channel) as u8,
                                    port: (*port) as u8,
                                });

                                continue;
                            }

                            // Writing to the BATCH register will send the data as a batch.
                            if address == batch_register {
                                if data.len() < 2 { continue; }

                                let mut out = vec![];

                                for chunk in data.chunks(2) {
                                    let [note, velocity] = chunk[..] else { break; };

                                    out.push((note % 128) as u8);
                                    out.push((velocity % 128) as u8);
                                }

                                block.events.push(Event::Midi {
                                    format: *format,
                                    data: out,
                                    channel: (*channel) as u8,
                                    port: (*port) as u8,
                                });

                                continue;
                            }
                        }

                        _ => {}
                    }
                }

                _ => {}
            }
        }

        Ok(())
    }
}