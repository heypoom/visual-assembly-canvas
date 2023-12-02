use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use snafu::ensure;
use crate::canvas::block::BlockData::{Clock, Machine, Memory, MidiIn, MidiOut, Osc, Pixel, Plot, Synth};
use crate::canvas::error::CanvasError::{BlockNotFound, DisconnectedPort, MachineError};
use crate::{Action, Event, Message, Sequencer};
use crate::audio::midi::{MidiOutputFormat};
use crate::audio::wavetable::Wavetable;
use crate::canvas::{BlockIdInUseSnafu};
use crate::canvas::CanvasError::{CannotFindWire};
use crate::canvas::PixelMode::{Append, Command, Replace};
use crate::canvas::vec_helper::extend_and_remove_oldest;
use super::block::{Block, BlockData};
use super::error::{BlockNotFoundSnafu, CannotWireToItselfSnafu, CanvasError, MachineNotFoundSnafu};
use super::wire::{Port, port, Wire};
use crate::audio::synth::{note_to_freq};
use crate::audio::synth::SynthTrigger::AttackRelease;
use crate::audio::waveform::Waveform;

type Errorable = Result<(), CanvasError>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub blocks: Vec<Block>,
    pub wires: Vec<Wire>,
    pub seq: Sequencer,

    pub block_id_counter: u16,
    pub wire_id_counter: u16,

    /// How many cycles should the machine run per tick? i.e. their clock speed.
    pub machine_cycle_per_tick: u16,

    /// How many messages can the inbox hold before it starts dropping messages?
    pub inbox_limit: usize,

    /// Used for pre-computing waveforms for performance.
    #[serde(skip)]
    pub wavetable: Wavetable,
}

impl Canvas {
    pub fn new() -> Canvas {
        Canvas {
            blocks: vec![],
            wires: vec![],

            seq: Sequencer::new(),
            wavetable: Wavetable::new(),

            block_id_counter: 0,
            wire_id_counter: 0,

            inbox_limit: 100,
            machine_cycle_per_tick: 1,
        }
    }

    pub fn block_id(&mut self) -> u16 {
        let id = self.block_id_counter;
        self.block_id_counter += 1;
        id
    }

    /// Set the machine's clock speed, in cycles per tick.
    pub fn set_machine_clock_speed(&mut self, cycle_per_tick: u16) {
        self.machine_cycle_per_tick = cycle_per_tick;
    }

    pub fn remove_block(&mut self, id: u16) -> Errorable {
        let block_idx = self.blocks.iter().position(|b| b.id == id).ok_or(BlockNotFound { id })?;

        // Teardown logic
        match self.blocks[block_idx].data {
            // Remove the machine from the sequencer.
            Machine { machine_id } => self.seq.remove(machine_id),

            _ => {}
        }

        // Remove blocks from the canvas.
        self.blocks.remove(block_idx);

        // Remove all wires connected to the block.
        self.wires.retain(|w| w.source.block != id && w.target.block != id);

        Ok(())
    }

    pub fn add_machine(&mut self) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_machine_with_id(id)?;

        Ok(id)
    }

    pub fn add_machine_with_id(&mut self, id: u16) -> Errorable {
        self.seq.add(id);
        self.add_block_with_id(id, Machine { machine_id: id })?;

        Ok(())
    }

    pub fn add_block(&mut self, data: BlockData) -> Result<u16, CanvasError> {
        let id = self.block_id();
        self.add_block_with_id(id, data)?;

        Ok(id)
    }

    pub fn add_block_with_id(&mut self, id: u16, data: BlockData) -> Errorable {
        // Prevent duplicate block ids from being added.
        ensure!(!self.blocks.iter().any(|b| b.id == id), BlockIdInUseSnafu {id});

        // Validate block data before adding them.
        match data {
            Machine { machine_id } => {
                ensure!(self.seq.get(machine_id).is_some(), MachineNotFoundSnafu { id: machine_id });
            }
            _ => {}
        }

        self.blocks.push(Block::new(id, data));
        Ok(())
    }

    pub fn connect(&mut self, source: Port, target: Port) -> Result<u16, CanvasError> {
        ensure!(source != target, CannotWireToItselfSnafu { port: source });

        // Do not add duplicate wires.
        if let Some(w) = self.wires.iter().find(|w| w.source == source && w.target == target) {
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
        let Some(wire_index) = self.wires.iter().position(|w| w.source == src && w.target == dst) else {
            return Err(CannotFindWire { src, dst });
        };

        self.wires.remove(wire_index);
        Ok(())
    }

    pub fn get_block(&self, id: u16) -> Result<&Block, CanvasError> {
        self.blocks.iter().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn mut_block(&mut self, id: u16) -> Result<&mut Block, CanvasError> {
        self.blocks.iter_mut().find(|b| b.id == id).ok_or(BlockNotFound { id })
    }

    pub fn tick(&mut self, count: u16) -> Errorable {
        let ids: Vec<u16> = self.blocks.iter().map(|b| b.id).collect();

        for _ in 0..count {
            // Collect the messages, and route them to their destination blocks.
            self.route_messages()?;

            // Tick each block.
            for id in ids.clone() {
                self.tick_block(id)?
            }

            // Tick the machine sequencer.
            if !self.seq.is_halted() {
                self.seq.step(self.machine_cycle_per_tick)
                    .map_err(|cause| MachineError { cause: cause.clone() })?;
            }
        }

        Ok(())
    }

    pub fn tick_block(&mut self, id: u16) -> Errorable {
        let block = self.mut_block(id)?;
        let messages = block.consume_messages();

        match &block.data {
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

    pub fn get_connected_sinks(&self, id: u16) -> Vec<Wire> {
        self.wires.iter().filter(|w| w.source.block == id).cloned().collect()
    }

    pub fn send_data_to_sinks(&mut self, id: u16, body: Vec<u16>) -> Errorable {
        let wires = self.get_connected_sinks(id);

        for wire in wires {
            self.send_message_to_port(Message { sender: wire.source, action: Action::Data { body: body.clone() } })?;
        }

        Ok(())
    }

    pub fn generate_waveform(&mut self, waveform: Waveform, time: u16) -> u16 {
        self.wavetable.get(waveform, time)
    }

    pub fn tick_osc_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in &messages {
            match &message.action {
                Action::SetWaveform { waveform: wf } => {
                    if let Osc { waveform } = &mut self.mut_block(id)?.data {
                        *waveform = *wf;
                    };
                }
                Action::Data { body } => {
                    let mut waveform = Waveform::Sine;

                    if let Osc { waveform: wf } = &self.get_block(id)?.data {
                        waveform = wf.clone();
                    }

                    // Generate the waveform values out of the given input values, between (0 - 255).
                    let mut values: Vec<u16> = vec![];

                    for v in body {
                        values.push(self.generate_waveform(waveform, *v));
                    }

                    // Send the waveform values to the connected blocks.
                    self.send_data_to_sinks(id, values)?;
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_synth_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in &messages {
            match &message.action {
                Action::Data { body } => {
                    // Collect the synth inputs into trigger events.
                    let mut triggers = vec![];

                    for c in body.chunks(2) {
                        let [note, time] = c else { continue; };

                        triggers.push(AttackRelease {
                            freq: note_to_freq(*note as u8),
                            duration: (*time as f32) / 255f32,
                            time: 0.0,
                        });
                    }

                    let block = self.mut_block(id)?;

                    if let Synth { .. } = &block.data {
                        block.events.push(Event::Synth {
                            triggers,
                        })
                    }
                }

                Action::Write { address, data } => {
                    let block = self.mut_block(id)?;

                    let Synth { .. } = block.data else { continue; };

                    let mut triggers = vec![];
                    let duration = *address + 1;

                    for note in data {
                        triggers.push(AttackRelease {
                            freq: note_to_freq(*note as u8),
                            duration: (duration as f32) / 255f32,
                            time: 0.0,
                        });
                    }

                    block.events.push(Event::Synth { triggers })
                }

                _ => {}
            }
        }

        Ok(())
    }

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

    pub fn tick_plotter_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Data { body } => {
                    let Plot { values, size } = &mut self.mut_block(id)?.data else { continue; };
                    extend_and_remove_oldest(values, body, *size as usize);
                }

                Action::Reset => {
                    let Plot { values, .. } = &mut self.mut_block(id)?.data else { continue; };
                    values.clear()
                }

                Action::Write { address, data } => {
                    let Plot { values, size } = &mut self.mut_block(id)?.data else { continue; };
                    if address >= *size { continue; }

                    if address as usize + data.len() >= values.len() {
                        values.resize(address as usize + data.len() + 1, 0);
                    }

                    for (i, byte) in data.iter().enumerate() {
                        values[address as usize + i] = *byte;
                    }
                }

                Action::Read { address, count } => {
                    let Plot { values, .. } = &self.get_block(id)?.data else { continue; };
                    let mut body = vec![];

                    if !values.is_empty() && address + count <= values.len() as u16 {
                        for i in 0..count {
                            body.push(values[(address + i) as usize]);
                        }
                    }

                    self.send_direct_message(id, message.sender.block, Action::Data { body })?;
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_memory_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Data { body } => {
                    let Memory { values } = &mut self.mut_block(id)?.data else { continue; };
                    values.extend(body)
                }

                Action::Write { address, data } => {
                    let Memory { values } = &mut self.mut_block(id)?.data else { continue; };

                    if address as usize + data.len() >= values.len() {
                        values.resize(address as usize + data.len() + 1, 0);
                    }

                    for (i, byte) in data.iter().enumerate() {
                        values[address as usize + i] = *byte;
                    }
                }

                Action::Read { address, count } => {
                    let Memory { values } = &self.get_block(id)?.data else { continue; };
                    let mut body = vec![];

                    if !values.is_empty() && address + count <= values.len() as u16 {
                        for i in 0..count {
                            body.push(values[(address + i) as usize]);
                        }
                    }

                    self.send_direct_message(id, message.sender.block, Action::Data { body })?;
                }

                Action::Reset => {
                    if let Memory { values } = &mut self.mut_block(id)?.data {
                        values.clear()
                    };
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_midi_in_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                Action::Midi { event, value, note, channel: ch, port: p } => {
                    if let MidiIn { on, channels, port, .. } = &self.get_block(id)?.data {
                        if *on != event || *port != (p as u16) { continue; }

                        // Enable channel filtering if channels are defined.
                        if channels.len() > 0 && !channels.contains(&(ch as u16)) { continue; }
                    }

                    self.send_data_to_sinks(id, vec![note as u16, value as u16])?;
                }

                Action::SetMidiPort { port: p } => {
                    if let MidiIn { port, .. } = &mut self.mut_block(id)?.data {
                        *port = p;
                    }
                }

                Action::SetMidiInputEvent { event } => {
                    if let MidiIn { on, .. } = &mut self.mut_block(id)?.data {
                        *on = event;
                    }
                }

                Action::SetMidiChannels { channels: chan } => {
                    if let MidiIn { channels, .. } = &mut self.mut_block(id)?.data {
                        *channels = chan;
                    }
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_midi_out_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        let block = self.mut_block(id)?;

        let MidiOut { format, channel, port } = &mut block.data else {
            return Ok(());
        };

        for message in messages {
            match message.action {
                Action::Data { body } => {
                    // MIDI channels and ports cannot be over 255.
                    if *channel > 255 || *port > 255 { continue; }

                    let mut data: Vec<u8> = body.iter().map(|v| *v as u8).collect();

                    match *format {
                        // Limit the note and control change bytes to 0 - 127.
                        MidiOutputFormat::Note | MidiOutputFormat::ControlChange => {
                            data = data.iter().map(|d| d % 128).collect();
                        }

                        // Reverse the data bytes to make it easier to process.
                        MidiOutputFormat::Raw | MidiOutputFormat::Launchpad => data.reverse(),
                    }

                    block.events.push(Event::Midi {
                        format: *format,
                        data,
                        channel: (*channel) as u8,
                        port: (*port) as u8,
                    })
                }

                Action::SetMidiOutputFormat { format: fmt } => {
                    *format = fmt;
                }

                Action::SetMidiPort { port: p } => {
                    *port = p;
                }

                Action::SetMidiChannels { channels } => {
                    if let Some(chan) = channels.first() {
                        *channel = *chan;
                    }
                }

                Action::Write { address, data } => {
                    // MIDI channels and ports cannot be over 255.
                    if *channel > 255 || *port > 255 { continue; }

                    let batch_register = 0x100;

                    match *format {
                        MidiOutputFormat::Note | MidiOutputFormat::ControlChange => {
                            // Writing below the batch register will send the data as a single note.
                            if address < batch_register {
                                let [velocity] = data[..] else { continue; };

                                block.events.push(Event::Midi {
                                    format: *format,
                                    data: vec![(address % 128) as u8, (velocity % 128) as u8],
                                    channel: (*channel) as u8,
                                    port: (*port) as u8,
                                });

                                continue;
                            }

                            // Writing to the BATCH register will send the data as a batch.
                            if address == batch_register {
                                if data.len() < 2 { continue; }

                                let mut out = vec![];

                                for chunk in data.chunks(2) {
                                    let [note, velocity] = chunk[..] else { break; };

                                    out.push((note % 128) as u8);
                                    out.push((velocity % 128) as u8);
                                }

                                block.events.push(Event::Midi {
                                    format: *format,
                                    data: out,
                                    channel: (*channel) as u8,
                                    port: (*port) as u8,
                                })
                            }
                        }

                        _ => {}
                    }
                }

                _ => {}
            }
        }

        Ok(())
    }

    pub fn tick_pixel_block(&mut self, id: u16, messages: Vec<Message>) -> Errorable {
        for message in messages {
            match message.action {
                // The "data" action is used to directly set the pixel data.
                Action::Data { body } => {
                    let Pixel { pixels, mode } = &mut self.mut_block(id)?.data else {
                        return Ok(());
                    };

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
                    let Pixel { pixels, .. } = &mut self.mut_block(id)?.data else {
                        return Ok(());
                    };

                    if address >= 5000 { continue; }

                    if address as usize + data.len() >= pixels.len() {
                        pixels.resize(address as usize + data.len() + 1, 0);
                    }

                    for (i, byte) in data.iter().enumerate() {
                        pixels[address as usize + i] = *byte;
                    }
                }

                Action::Read { address, count } => {
                    let Pixel { pixels, .. } = &self.get_block(id)?.data else {
                        return Ok(());
                    };

                    let mut body = vec![];

                    if !pixels.is_empty() && address + count <= pixels.len() as u16 {
                        for i in 0..count {
                            body.push(pixels[(address + i) as usize]);
                        }
                    }

                    self.send_direct_message(id, message.sender.block, Action::Data { body })?;
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


    // TODO: improve bi-directional connection resolution.
    pub fn resolve_port(&self, port: Port) -> Option<Vec<u16>> {
        Some(self.wires.iter().filter(|w| w.source == port || w.target == port).map(|w| w.target.block).collect())
    }

    /// Run every machine until all halts.
    pub fn run(&mut self) -> Errorable {
        self.seq.ready();

        for _ in 1..1000 {
            if self.seq.is_halted() { break; }
            self.tick(1)?;
        }

        self.tick(1)?;

        Ok(())
    }

    /// Collect messages from each outboxes to the respective inboxes.
    pub fn route_messages(&mut self) -> Errorable {
        // Collect the messages from the blocks and the machines.
        let mut messages = self.consume_messages();
        messages.extend(self.seq.consume_messages());

        for message in messages {
            self.send_message_to_port(message)?;
        }

        Ok(())
    }

    fn consume_messages(&mut self) -> Vec<Message> {
        self.blocks.iter_mut().flat_map(|block| block.outbox.drain(..)).collect()
    }

    pub fn load_program(&mut self, id: u16, source: &str) -> Errorable {
        self.seq.load(id, source).map_err(|cause| MachineError { cause })
    }

    /// Sends the message to the destination port.
    pub fn send_message_to_port(&mut self, message: Message) -> Errorable {
        // There might be more than one destination machine connected to a port.
        let recipients = self.resolve_port(message.sender).ok_or(DisconnectedPort { port: message.sender })?;

        // We submit different messages to each machines.
        for recipient_id in recipients {
            self.send_message_to_recipient(recipient_id, message.clone())?;
        }

        Ok(())
    }

    /// Send a message from an actor to another actor.
    pub fn send_direct_message(&mut self, from: u16, to: u16, action: Action) -> Errorable {
        self.send_message_to_recipient(to, Message { action, sender: port(from, 0) })?;

        Ok(())
    }

    /// Sends the message to the specified block.
    pub fn send_message_to_block(&mut self, block_id: u16, action: Action) -> Errorable {
        self.mut_block(block_id)?.inbox.push_back(Message { sender: port(block_id, 60000), action });

        Ok(())
    }

    pub fn send_message_to_recipient(&mut self, recipient_id: u16, message: Message) -> Errorable {
        let inbox_limit = self.inbox_limit;

        if let Ok(block) = self.mut_block(recipient_id) {
            match block.data {
                // Send the message directly to the machine.
                Machine { machine_id } => {
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

    pub fn update_block(&mut self, id: u16, data: BlockData) -> Errorable {
        self.mut_block(id)?.data = data;
        Ok(())
    }

    pub fn reset_blocks(&mut self) -> Errorable {
        // Collect the ids of the blocks that we can reset.
        // Machine block is handled separately, so we don't need to tick them.
        let ids: Vec<_> = self.blocks.iter().filter(|b| !b.data.is_machine()).map(|b| b.id).collect();

        for id in ids {
            if let Memory { .. } = self.get_block(id)?.data { continue; }

            self.reset_block(id)?;
        }

        Ok(())
    }

    pub fn reset_block(&mut self, id: u16) -> Errorable {
        self.send_message_to_block(id, Action::Reset)?;
        self.tick_block(id)?;

        Ok(())
    }

    /// Disable the await watchdog if we know the message will eventually arrive.
    pub fn set_await_watchdog(&mut self, enabled: bool) {
        self.seq.await_watchdog = enabled;
    }

    /// Consume the side effect events in the frontend.
    pub fn consume_block_side_effects(&mut self) -> HashMap<u16, Vec<Event>> {
        let mut effects = HashMap::new();

        for block in &mut self.blocks {
            effects.insert(block.id, block.events.drain(..).collect());
        }

        effects
    }
}
