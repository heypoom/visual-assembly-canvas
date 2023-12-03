use crate::canvas::Canvas;
use crate::canvas::canvas::Errorable;
use crate::{Action, Message};
use crate::canvas::blocks::BlockData::Pixel;
use crate::canvas::virtual_io::{read_from_address, write_to_address};

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use crate::canvas::blocks::pixel::PixelMode::{Append, Command, Replace};

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

impl Canvas {
    pub fn tick_pixel_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                // The "data" action is used to directly set the pixel data.
                Action::Data { body } => {
                    let Pixel { pixels, mode } = &mut self.mut_block(id)?.data else { continue; };

                    match mode {
                        Replace => {
                            pixels.clear();
                            pixels.extend(&body);
                        }
                        Append => {
                            for byte in body {
                                // Remove one pixel.
                                if byte == 0 {
                                    if !pixels.is_empty() {
                                        pixels.pop();
                                    }

                                    continue;
                                }

                                pixels.push(byte);
                            }
                        }
                        Command => {
                            // TODO: implement command consumer
                        }
                    }
                }

                Action::Write { address, data } => {
                    let Pixel { pixels, .. } = &mut self.mut_block(id)?.data else { continue; };
                    if address >= 5000 { continue; }

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