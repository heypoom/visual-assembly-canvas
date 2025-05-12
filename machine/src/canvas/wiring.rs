use super::canvas_error::{BlockNotFoundSnafu, CannotWireToItselfSnafu};
use crate::canvas::canvas::Errorable;
use crate::canvas::wire::{Port, Wire};
use crate::canvas::CanvasError::CannotFindWire;
use crate::canvas::{Canvas, CanvasError};
use crate::{Action, Message};
use snafu::ensure;

impl Canvas {
    pub fn connect(&mut self, source: Port, target: Port) -> Result<u16, CanvasError> {
        ensure!(source != target, CannotWireToItselfSnafu { port: source });

        // Do not add duplicate wires.
        if let Some(w) = self
            .wires
            .iter()
            .find(|w| w.source == source && w.target == target)
        {
            return Ok(w.id);
        }

        // Source block must exist.
        ensure!(
            self.blocks.iter().any(|b| b.id == source.block),
            BlockNotFoundSnafu { id: source.block },
        );

        // Target block must exist.
        ensure!(
            self.blocks.iter().any(|b| b.id == target.block),
            BlockNotFoundSnafu { id: target.block },
        );

        // Increment the wire id
        let id = self.wire_id_counter;
        self.wire_id_counter += 1;

        self.wires.push(Wire { id, source, target });
        Ok(id)
    }

    pub fn disconnect(&mut self, src: Port, dst: Port) -> Errorable {
        let Some(wire_index) = self
            .wires
            .iter()
            .position(|w| w.source == src && w.target == dst)
        else {
            return Err(CannotFindWire { src, dst });
        };

        self.wires.remove(wire_index);
        Ok(())
    }

    pub fn send_message_to_sinks(&mut self, id: u16, action: Action) -> Errorable {
        let wires: Vec<Wire> = self
            .wires
            .iter()
            .filter(|w| w.source.block == id)
            .cloned()
            .collect();

        for wire in wires {
            self.send_message_to_port(Message {
                sender: wire.source,
                action: action.clone(),
                recipient: None,
            })?;
        }

        Ok(())
    }

    pub fn send_data_to_sinks(&mut self, id: u16, body: Vec<u16>) -> Errorable {
        self.send_message_to_sinks(id, Action::Data { body })
    }
}
