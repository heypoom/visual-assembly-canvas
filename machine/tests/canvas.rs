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
    fn test_send_set_pixel_message() -> Errorable {
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
}