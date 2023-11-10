#[cfg(test)]
mod canvas_tests {
    use machine::canvas::block::BlockData::{PixelBlock};
    use machine::canvas::Canvas;
    use machine::canvas::error::CanvasError;
    use machine::canvas::wire::{port};

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_add_wire_block() -> Errorable {
        let mut c = Canvas::new();
        let a = c.add_machine()?;
        let b = c.add_block(PixelBlock { pixels: vec![] })?;

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
        let b = c.add_block(PixelBlock { pixels: vec![] })?;
        c.connect(port(a, 0), port(b, 0))?;

        c.load_program(a, r"
            push 0xAA
            push 0xBB
            push 0xCC
            send 0 3
        ")?;

        c.run()?;

        assert_eq!(c.blocks[1].data, PixelBlock { pixels: vec![0xCC, 0xBB, 0xAA] });

        Ok(())
    }
}