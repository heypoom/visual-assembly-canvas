use crate::canvas::canvas::Errorable;
use crate::canvas::Canvas;
use crate::Message;

impl Canvas {
    /// Collect messages from each outboxes to the respective inboxes.
    pub fn route_messages(&mut self) -> Errorable {
        // Collect the messages from the blocks and the machines.
        let mut messages = self.consume_messages();
        messages.extend(self.seq.consume_messages());

        // If the message has a recipient, send it directly to the machine.
        // Otherwise, identify connected blocks and send the message to them.
        for message in messages {
            match message.recipient {
                Some(_) => self.send_message_to_recipient(message)?,
                None => self.send_message_to_port(message)?,
            }
        }

        Ok(())
    }

    fn consume_messages(&mut self) -> Vec<Message> {
        self.blocks
            .iter_mut()
            .flat_map(|block| block.outbox.drain(..))
            .collect()
    }
}
