use crate::canvas::blocks::BlockData::Clock;
use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};

impl Canvas {
    pub fn tick_clock_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let Clock { time, rate } = &mut self.mut_block(id)?.data else { return Ok(()); };

        // increment the time, or wrap around to 0.
        *time = (*time).checked_add(1).unwrap_or(0);

        // wrap around at 255.
        if *time >= 255 {
            *time = 0;
        }

        for message in &messages {
            match &message.action {
                Action::Reset => {
                    *time = 0;
                }
                _ => {}
            }
        }

        // Do not send the clock signal in some ticks.
        if *rate > 1 && (*time % *rate != 0) { return Ok(()); };

        // Send data to sinks
        if let Clock { time, .. } = self.get_block(id)?.data {
            self.send_data_to_sinks(id, vec![time])?;
        }

        Ok(())
    }
}