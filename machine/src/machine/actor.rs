use crate::{Action, Machine, Message, RuntimeError};
use crate::canvas::wire::port;

type Errorable = Result<(), RuntimeError>;

pub trait Actor {
    /// Push a message to a recipient's mailbox.
    fn send_message(&mut self, to: u16, action: Action);

    /// Receive incoming messages from our mailbox.
    fn receive_messages(&mut self) -> Errorable;
}

impl Actor for Machine {
    fn send_message(&mut self, src_port: u16, action: Action) {
        // If the machine has no address, it cannot send messages.
        let Some(sender) = self.id else { return; };

        // Add the message to the mailbox.
        self.outbox.push(Message { port: port(sender, src_port), action });
    }

    fn receive_messages(&mut self) -> Errorable {
        while self.expected_receives > 0 {
            // The machine expects a message,
            // but the message has yet to arrive in the mailbox at this time.
            if self.inbox.is_empty() { break; }

            // A new message arrived!
            // We can process them now.
            let Some(message) = self.inbox.pop_back() else { break; };
            self.expected_receives -= 1;

            match message.action {
                // If the message is a data message, push the data onto the stack.
                Action::Data { body } => {
                    for v in body.iter() {
                        self.stack().push(*v)?;
                    }
                }
                _ => {}
            }
        }

        Ok(())
    }
}