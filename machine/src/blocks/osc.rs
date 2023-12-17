use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::audio::waveform::Waveform;
use crate::blocks::BlockData::Osc;

impl Canvas {
    pub fn tick_osc_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in &messages {
            match &message.action {
                Action::Data { body } => {
                    let mut waveform = Waveform::Sine;

                    if let Osc { waveform: wf } = &self.get_block(id)?.data {
                        waveform = wf.clone();
                    }

                    // Generate the waveform values out of the given input values, between (0 - 255).
                    let mut values: Vec<u16> = vec![];

                    for v in body {
                        values.push(self.generate_waveform(waveform, *v));
                    }

                    // Send the waveform values to the connected blocks.
                    self.send_data_to_sinks(id, values)?;
                }

                _ => {}
            }
        }

        Ok(())
    }

    fn generate_waveform(&mut self, waveform: Waveform, time: u16) -> u16 {
        self.wavetable.get(waveform, time)
    }
}