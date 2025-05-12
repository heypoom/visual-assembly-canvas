use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::blocks::InternalBlockData::Plot;
use crate::canvas::vec_helper::extend_and_remove_oldest;
use crate::canvas::virtual_io::{read_from_address, write_to_address};

impl Canvas {
    pub fn tick_plotter_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Data { body } => {
                    let Plot { values, size } = self.mut_built_in_data_by_id(id)? else { continue; };
                    extend_and_remove_oldest(values, body, *size as usize);
                }

                Action::Reset => {
                    let Plot { values, .. } = self.mut_built_in_data_by_id(id)? else { continue; };
                    values.clear()
                }

                Action::Write { address, data } => {
                    let Plot { values, size } = self.mut_built_in_data_by_id(id)? else { continue; };
                    if address >= *size { continue; }

                    write_to_address(address, data, values);
                }

                Action::Read { address, count } => {
                    if let Plot { values, .. } = self.built_in_data_by_id(id)? {
                        let action = read_from_address(address, count, &values);
                        self.send_direct_message(id, message.sender.block, action)?;
                    };
                }

                _ => {}
            }
        }

        Ok(())
    }
}