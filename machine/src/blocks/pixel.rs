use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::blocks::BlockData::Pixel;
use crate::canvas::virtual_io::{read_from_address, write_to_address};

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use crate::blocks::pixel::PixelMode::{Append, Command, Replace};

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PixelMode {
    /// Replaces the content of the block with the given byte.
    Replace,

    /// Append the pixel to the block. Byte zero deletes one pixel.
    Append,

    /// Send command packets to alter the block.
    Command,
}

static CLEAR_ADDRESS: u16 = 0x1FF;

impl Canvas {
    pub fn tick_pixel_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Data { body } => {
                    let Pixel { pixels, mode } = &mut self.mut_block(id)?.data else { continue; };

                    match mode {
                        Append => {
                            for byte in body {
                                pixels.push(byte);
                            }
                        }

                        Replace => {
                            pixels.clear();
                            pixels.extend(&body);
                        }

                        Command => {
                            // TODO: implement command consumer
                        }
                    }
                }

                Action::Write { address, data } => {
                    let Pixel { pixels, .. } = &mut self.mut_block(id)?.data else { continue; };

                    // Writing to this address clears the block.
                    if address == CLEAR_ADDRESS {
                        pixels.clear();
                        continue;
                    }

                    write_to_address(address, data, pixels);
                }

                Action::Read { address, count } => {
                    if let Pixel { pixels, .. } = &self.get_block(id)?.data {
                        let action = read_from_address(address, count, &pixels);
                        self.send_direct_message(id, message.sender.block, action)?;
                    };
                }

                Action::SetPixelMode { mode: m } => {
                    if let Pixel { mode, .. } = &mut self.mut_block(id)?.data {
                        *mode = m;
                    };
                }

                Action::Reset => {
                    if let Pixel { pixels, .. } = &mut self.mut_block(id)?.data {
                        pixels.clear()
                    };
                }

                _ => {}
            }
        }

        Ok(())
    }
}