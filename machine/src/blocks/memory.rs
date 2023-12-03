use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::blocks::BlockData::Memory;
use crate::canvas::virtual_io::{read_from_address, write_to_address};

const REQUEST_DATA: u16 = 0x1EE;

impl Canvas {
    pub fn tick_memory_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Data { body } => {
                    let Memory { values, .. } = &mut self.mut_block(id)?.data else { continue; };
                    values.extend(body)
                }

                Action::Override { data } => {
                    let Memory { values, .. } = &mut self.mut_block(id)?.data else { continue; };
                    values.clear();
                    values.extend(data);
                }

                Action::Write { address, data } => {
                    let Memory { values, .. } = &mut self.mut_block(id)?.data else { continue; };

                    // HACK: this is a special address that requests data from the block.
                    //       our mapped port can only handle up to 0x200 addresses.
                    // TODO: implement a paged memory system.
                    if address == REQUEST_DATA {
                        if let [offset, count] = data[..] {
                            let action = read_from_address(offset, count, &values);
                            self.send_direct_message(id, message.sender.block, action)?;
                            continue;
                        }
                    }

                    write_to_address(address, data, values);
                }

                Action::Read { address, count } => {
                    if let Memory { values, .. } = &self.get_block(id)?.data {
                        let action = read_from_address(address, count, &values);
                        self.send_direct_message(id, message.sender.block, action)?;
                    };
                }

                Action::Reset => {
                    if let Memory { values, .. } = &mut self.mut_block(id)?.data {
                        values.clear()
                    };
                }

                Action::SetAutoReset { auto_reset: value } => {
                    let Memory { auto_reset, .. } = &mut self.mut_block(id)?.data else { continue; };

                    *auto_reset = value;
                }

                _ => {}
            }
        }

        Ok(())
    }
}