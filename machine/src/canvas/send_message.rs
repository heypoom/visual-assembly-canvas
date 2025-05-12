use crate::blocks::BlockDataByType::BuiltIn;
use crate::blocks::InternalBlockData::Machine;
use crate::canvas::canvas::Errorable;
use crate::canvas::wire::{port, Port};
use crate::canvas::Canvas;
use crate::canvas::CanvasError::MissingMessageRecipient;
use crate::{Action, Message};

impl Canvas {
    /// Sends the message to the destination port.
    pub fn send_message_to_port(&mut self, message: Message) -> Errorable {
        // If the message has a recipient, send it directly to the machine instead.
        if message.recipient.is_some() {
            return self.send_message_to_recipient(message);
        }

        // There might be more than one destination machine connected to a port.
        let recipients = self.resolve_port(message.sender);

        // We submit different messages to each blocks.
        for recipient_id in recipients {
            self.send_message_to_recipient(Message {
                action: message.action.clone(),
                sender: message.sender,
                recipient: Some(recipient_id),
            })?;
        }

        Ok(())
    }

    /// Send a message from an actor to another actor.
    pub fn send_direct_message(&mut self, from: u16, to: u16, action: Action) -> Errorable {
        self.send_message_to_recipient(Message {
            action,
            sender: port(from, 0),
            recipient: Some(to),
        })?;

        Ok(())
    }

    /// Sends the message to the specified block.
    pub fn send_message_to_block(&mut self, block_id: u16, action: Action) -> Errorable {
        self.mut_block(block_id)?.inbox.push_back(Message {
            sender: port(block_id, 60000),
            action,
            recipient: Some(block_id),
        });

        Ok(())
    }

    pub fn send_message_to_recipient(&mut self, message: Message) -> Errorable {
        let inbox_limit = self.inbox_limit;

        let Some(recipient_id) = message.recipient else {
            return Err(MissingMessageRecipient { message });
        };

        if let Ok(block) = self.mut_block(recipient_id) {
            match block.data {
                // Send the message directly to the machine.
                BuiltIn {
                    data: Machine { machine_id },
                } => {
                    if let Some(m) = self.seq.get_mut(machine_id) {
                        m.inbox.push_back(message);

                        if m.inbox.len() > inbox_limit {
                            m.inbox.pop_front();
                        }
                    }
                }

                _ => {
                    block.inbox.push_back(message);

                    if block.inbox.len() > inbox_limit {
                        block.inbox.pop_front();
                    }
                }
            }
        }

        Ok(())
    }

    /// Given the sender's port, resolve the target block ids.
    /// TODO: improve bi-directional connection resolution.
    fn resolve_port(&self, sender: Port) -> Vec<u16> {
        let targets: Vec<u16> = self
            .wires
            .iter()
            .filter(|w| w.source == sender)
            .map(|w| w.target.block)
            .collect();

        if !targets.is_empty() {
            return targets;
        }

        let sources: Vec<u16> = self
            .wires
            .iter()
            .filter(|w| w.target == sender)
            .map(|w| w.source.block)
            .collect();

        if !sources.is_empty() {
            return sources;
        }

        vec![]
    }
}
