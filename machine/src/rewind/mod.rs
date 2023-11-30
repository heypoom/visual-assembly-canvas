pub mod diff;

use diff::{Patch, diff_slice};
use crate::canvas::block::Block;
use crate::canvas::Canvas;
use crate::canvas::wire::Wire;
use crate::{Event, Message};

/// Stores the diff patches for the canvas.
#[derive(Debug, Clone)]
pub struct CanvasSnapshot {
    pub blocks: Vec<Patch<Block>>,
    pub wires: Vec<Patch<Wire>>,
    pub memories: Vec<MemoryPatch>,
    pub mailboxes: Vec<MailboxPatch>,
}

#[derive(Debug, Clone)]
pub struct MemoryPatch {
    pub machine_id: u16,
    pub memory: Vec<Patch<u16>>,
    pub register: Vec<Patch<u16>>,
}

#[derive(Debug, Clone)]
pub struct MailboxPatch {
    pub id: u16,
    pub is_machine: bool,
    pub inbox: Vec<Patch<Message>>,
    pub outbox: Vec<Patch<Message>>,
    pub events: Vec<Patch<Event>>,
}

#[derive(Debug, Clone)]
pub struct Rewind {
    pub snapshots: Vec<CanvasSnapshot>,
    pub previous: Option<Canvas>,
}

impl Rewind {
    pub fn new() -> Rewind {
        Rewind { snapshots: vec![], previous: None }
    }

    pub fn save(&mut self, canvas: &Canvas) {
        if let Some(previous) = &self.previous {
            let mut memories: Vec<MemoryPatch> = vec![];
            let mut mailboxes: Vec<MailboxPatch> = vec![];

            for curr in &canvas.seq.machines {
                if let Some(prev) = previous.seq.machines.iter().find(|m| m.id == curr.id) {
                    let id = curr.id.unwrap_or(0);

                    let memory = diff_slice(&prev.mem.buffer, &curr.mem.buffer);
                    let register = diff_slice(&prev.reg.buffer, &curr.reg.buffer);

                    // let inbox = diff_slice(prev.inbox.make_contiguous(), &curr.inbox);
                    let inbox = vec![];
                    let outbox = diff_slice(&prev.outbox, &curr.outbox);
                    let events = diff_slice(&prev.events, &curr.events);

                    if !memory.is_empty() || !register.is_empty() {
                        memories.push(MemoryPatch {
                            machine_id: id,
                            register,
                            memory,
                        });
                    }

                    if !outbox.is_empty() || !events.is_empty() {
                        mailboxes.push(MailboxPatch {
                            id,
                            inbox,
                            outbox,
                            events,
                            is_machine: true,
                        });
                    }
                }
            }

            let snapshot = CanvasSnapshot {
                blocks: diff_slice(&previous.blocks, &canvas.blocks),
                wires: diff_slice(&previous.wires, &canvas.wires),
                memories,
                mailboxes,
            };

            self.snapshots.push(snapshot);
        }

        self.previous = Some(canvas.clone());
    }

    pub fn rollback(&self, dst: &mut Canvas, snap: &CanvasSnapshot) {
        if !snap.memories.is_empty() {
            for mem in &snap.memories {
                let id = mem.machine_id;
                let Some(m) = dst.seq.get_mut(id) else { continue; };

                for patch in &mem.memory {
                    if let Some(from) = patch.from {
                        m.mem.buffer[patch.index] = from;
                    }
                }

                for patch in &mem.register {
                    if let Some(from) = patch.from {
                        m.mem.buffer[patch.index] = from;
                    }
                }
            }
        }

        todo!("apply snapshot to canvas")
    }

    pub fn apply(&self, dst: &mut Canvas, snap: &CanvasSnapshot) {
        if !snap.memories.is_empty() {
            for mem in &snap.memories {
                let id = mem.machine_id;
                let Some(m) = dst.seq.get_mut(id) else { continue; };

                for patch in &mem.memory {
                    if let Some(to) = patch.to {
                        m.mem.buffer[patch.index] = to;
                    }
                }

                for patch in &mem.register {
                    if let Some(to) = patch.to {
                        m.mem.buffer[patch.index] = to;
                    }
                }
            }
        }

        todo!("apply snapshot to canvas")
    }
}

#[cfg(test)]
mod rewind_tests {
    use crate::canvas::{Canvas, CanvasError};
    use crate::rewind::Rewind;

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_rewind_canvas() -> Errorable {
        let mut r = Rewind::new();

        let mut c = Canvas::new();
        c.add_machine()?;
        r.save(&c);

        c.load_program(0, r"
            push 5
            push 10
            add
        ")?;
        r.save(&c);

        c.seq.ready();
        r.save(&c);

        c.tick(1)?;
        r.save(&c);

        c.add_machine()?;
        r.save(&c);

        // println!("{:?}", r.snapshots);

        Ok(())
    }
}