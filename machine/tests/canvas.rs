#[cfg(test)]
mod canvas_tests {
    use machine::canvas::block::BlockData::{Clock, Pixel, Plot};
    use machine::canvas::{Canvas, PixelMode};
    use machine::canvas::error::CanvasError;
    use machine::canvas::wire::{port};

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_add_wire_block() -> Errorable {
        let mut c = Canvas::new();
        let a = c.add_machine()?;
        let b = c.add_block(Pixel { pixels: vec![], mode: PixelMode::Replace })?;

        // connect machine block to pixel block.
        c.connect(port(a, 0), port(b, 0))?;

        assert_eq!(c.blocks[a as usize].id, 0);
        assert_eq!(c.wires[0].id, 0);
        assert_eq!(c.wires[0].target.port, 0);
        assert_eq!(c.wires[0].target.block, b);

        Ok(())
    }

    #[test]
    fn test_machine_set_pixel_block() -> Errorable {
        let mut c = Canvas::new();
        let a = c.add_machine()?;
        let b = c.add_block(Pixel { pixels: vec![], mode: PixelMode::Replace })?;
        c.connect(port(a, 0), port(b, 0))?;

        c.load_program(a, r"
            push 0xAA
            push 0xBB
            push 0xCC
            send 0 3
        ")?;

        c.run()?;

        assert_eq!(c.blocks[1].data, Pixel {
            pixels: vec![0xCC, 0xBB, 0xAA],
            mode: PixelMode::Replace,
        });

        Ok(())
    }

    #[test]
    fn test_multiple_dispatch() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_machine()?;
        c.add_machine()?;

        c.connect(port(0, 0), port(1, 0))?;
        c.connect(port(0, 0), port(2, 0))?;

        c.load_program(0, r"
            push 0xCC
            send 0 1
        ")?;

        c.load_program(1, "receive")?;
        c.load_program(2, "receive")?;
        c.run()?;

        assert_eq!(c.seq.get(1).unwrap().mem.read_stack(1), [0xCC]);
        assert_eq!(c.seq.get(2).unwrap().mem.read_stack(1), [0xCC]);

        Ok(())
    }

    #[test]
    fn test_plotter_drain() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_block(Plot { values: vec![], size: 5 })?;

        c.load_program(0, r"
            looper:
            push 2
            send 0 1
            jump looper
        ")?;

        c.connect(port(0, 0), port(1, 0))?;
        c.seq.ready();

        for _ in 0..32 {
            c.tick()?;
        }

        assert_eq!(c.blocks[1].data, Plot { values: vec![2, 2, 2, 2, 2], size: 5 });

        Ok(())
    }

    #[test]
    fn test_clock_wraparound() -> Errorable {
        let mut c = Canvas::new();
        c.add_block(Clock { time: 250 })?;
        c.add_block(Plot { values: vec![], size: 5 })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.tick()?;

        if let Clock { time } = c.blocks[0].data {
            assert_eq!(time, 251);
        }

        for _ in 0..10 { c.tick()?; }

        if let Clock { time } = c.blocks[0].data {
            assert_eq!(time, 6);
        }

        Ok(())
    }
}