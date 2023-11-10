#[cfg(test)]
mod canvas_tests {
    use machine::canvas::block::BlockData::{PixelBlock};
    use machine::canvas::Canvas;
    use machine::canvas::error::CanvasError;
    use machine::canvas::wire::{port};
    use machine::canvas::error::CanvasError::MachineError;

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_add_wire_block() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_block(PixelBlock { pixels: vec![] })?;

        // connect machine block to pixel block.
        c.connect(port(0, 0), port(1, 0))?;

        assert_eq!(c.blocks[0].id, 0);
        assert_eq!(c.wires[0].id, 0);
        assert_eq!(c.wires[0].target.port, 0);

        Ok(())
    }

    #[test]
    fn test_machine_set_pixel_block() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_block(PixelBlock { pixels: vec![] })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.router.load(0, r"
            push 0xAA
            push 0xBB
            push 0xCC
            send 0 3
        ").map_err(|cause| MachineError { cause })?;

        c.run()?;

        assert_eq!(c.blocks[1].data, PixelBlock { pixels: vec![0xCC, 0xBB, 0xAA] });

        Ok(())
    }
}