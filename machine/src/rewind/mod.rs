pub mod diff;

use diff::{Patch, diff_slice};
use crate::canvas::block::Block;
use crate::canvas::Canvas;
use crate::canvas::wire::Wire;

/// Stores the diff patches for the canvas.
#[derive(Debug, Clone)]
pub struct CanvasSnapshot {
    pub blocks: Vec<Patch<Block>>,
    pub wires: Vec<Patch<Wire>>,
    pub memories: Vec<MemoryPatch>,
}

#[derive(Debug, Clone)]
pub struct MemoryPatch {
    pub machine_id: u16,
    pub memory: Vec<Patch<u16>>,
    pub register: Vec<Patch<u16>>,
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

            for curr in &canvas.seq.machines {
                if let Some(prev) = previous.seq.machines.iter().find(|m| m.id == curr.id) {
                    let memory = diff_slice(&prev.mem.buffer, &curr.mem.buffer);
                    let register = diff_slice(&prev.reg.buffer, &curr.reg.buffer);

                    if !memory.is_empty() || !register.is_empty() {
                        memories.push(MemoryPatch {
                            machine_id: curr.id.unwrap_or(0),
                            register,
                            memory,
                        });
                    }
                }
            }

            let snapshot = CanvasSnapshot {
                blocks: diff_slice(&previous.blocks, &canvas.blocks),
                wires: diff_slice(&previous.wires, &canvas.wires),
                memories,
            };

            self.snapshots.push(snapshot);
        }

        self.previous = Some(canvas.clone());
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

        c.tick()?;
        r.save(&c);

        c.add_machine()?;
        r.save(&c);

        // println!("{:?}", r.snapshots);

        Ok(())
    }
}