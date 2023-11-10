#[cfg(test)]
mod canvas_tests {
    use machine::canvas::block::BlockData::{PixelBlock};
    use machine::canvas::Canvas;
    use machine::canvas::error::CanvasError;
    use machine::canvas::wire::{port};
    use machine::{Action, Message};

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
    fn test_push_message_to_pixel_block() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_block(PixelBlock { pixels: vec![] })?;

        // push message from machine block to pixel block.
        c.push_message(Message {
            from: 0,
            to: 1,
            action: Action::Data { body: vec![0xAA, 0xBB, 0xCC] },
        })?;

        assert_eq!(c.blocks[1].data, PixelBlock { pixels: vec![] });

        c.tick()?;

        assert_eq!(c.blocks[1].data, PixelBlock { pixels: vec![0xAA, 0xBB, 0xCC] });

        Ok(())
    }
}