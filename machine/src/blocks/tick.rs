use crate::blocks::BlockDataByType::BuiltIn;
use crate::blocks::InternalBlockData::{Clock, Memory, MidiIn, MidiOut, Osc, Pixel, Plot, Synth};
use crate::canvas::Canvas;

impl Canvas {
    pub fn tick_block(&mut self, id: u16) -> crate::canvas::canvas::Errorable {
        let block = self.mut_block(id)?;
        let messages = block.consume_messages();

        // TODO: handle externals?
        let BuiltIn { data } = &block.data else {
            return Ok(());
        };

        match data {
            Pixel { .. } => self.tick_pixel_block(id, messages)?,
            Plot { .. } => self.tick_plotter_block(id, messages)?,
            Osc { .. } => self.tick_osc_block(id, messages)?,
            Clock { .. } => self.tick_clock_block(id, messages)?,
            MidiIn { .. } => self.tick_midi_in_block(id, messages)?,
            MidiOut { .. } => self.tick_midi_out_block(id, messages)?,
            Synth { .. } => self.tick_synth_block(id, messages)?,
            Memory { .. } => self.tick_memory_block(id, messages)?,
            _ => {}
        }

        Ok(())
    }
}
