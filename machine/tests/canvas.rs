#[cfg(test)]
mod canvas_tests {
    use machine::blocks::pixel::PixelMode;
    use machine::blocks::BlockDataByType::BuiltIn;
    use machine::blocks::InternalBlockData::{Clock, Memory, Pixel, Plot};
    use machine::canvas::canvas_error::CanvasError;
    use machine::canvas::wire::port;
    use machine::canvas::Canvas;

    type Errorable = Result<(), CanvasError>;

    #[test]
    fn test_add_wire_block() -> Errorable {
        let mut c = Canvas::new();
        let a = c.add_machine()?;
        let b = c.add_built_in_block(Pixel {
            pixels: vec![],
            mode: PixelMode::Replace,
        })?;

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
        let b = c.add_built_in_block(Pixel {
            pixels: vec![],
            mode: PixelMode::Replace,
        })?;
        c.connect(port(a, 0), port(b, 0))?;

        c.load_program(
            a,
            r"
            push 0xAA
            push 0xBB
            push 0xCC
            send 0 3
        ",
        )?;

        c.run()?;

        assert_eq!(
            c.blocks[1].data,
            BuiltIn {
                data: Pixel {
                    pixels: vec![0xCC, 0xBB, 0xAA],
                    mode: PixelMode::Replace,
                }
            }
        );

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

        c.load_program(
            0,
            r"
            push 0xCC
            send 0 1
        ",
        )?;

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
        c.add_built_in_block(Plot {
            values: vec![],
            size: 5,
        })?;

        c.load_program(
            0,
            r"
            looper:
            push 2
            send 0 1
            jump looper
        ",
        )?;

        c.connect(port(0, 0), port(1, 0))?;
        c.seq.ready();

        c.tick(32)?;

        assert_eq!(
            c.blocks[1].data,
            BuiltIn {
                data: Plot {
                    values: vec![2, 2, 2, 2, 2],
                    size: 5
                }
            }
        );

        Ok(())
    }

    #[test]
    fn test_clock_wraparound() -> Errorable {
        let mut c = Canvas::new();
        c.add_built_in_block(Clock {
            time: 250,
            freq: 1,
            ping: false,
        })?;
        c.add_built_in_block(Plot {
            values: vec![],
            size: 5,
        })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.tick(1)?;

        if let BuiltIn {
            data: Clock { time, .. },
        } = c.blocks[0].data
        {
            assert_eq!(time, 251);
        }

        c.tick(10)?;

        if let BuiltIn {
            data: Clock { time, .. },
        } = c.blocks[0].data
        {
            assert_eq!(time, 6);
        }

        Ok(())
    }

    #[test]
    fn test_clock_rate() -> Errorable {
        let mut c = Canvas::new();
        c.add_built_in_block(Clock {
            time: 250,
            freq: 8,
            ping: false,
        })?;
        c.add_built_in_block(Plot {
            values: vec![],
            size: 5,
        })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.tick(50)?;

        assert_eq!(
            c.blocks[1].data,
            BuiltIn {
                data: Plot {
                    values: vec![8, 16, 24, 32, 40],
                    size: 5
                }
            }
        );

        Ok(())
    }

    #[test]
    fn test_mapped_store() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_built_in_block(Pixel {
            pixels: vec![],
            mode: PixelMode::Replace,
        })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.load_program(
            0,
            r"
            push 69
            store 0x2000

            push 96
            store 0x2001
        ",
        )?;

        c.seq.ready();
        c.tick(5)?;

        assert_eq!(
            c.blocks[1].data,
            BuiltIn {
                data: Pixel {
                    pixels: vec![69, 96, 0],
                    mode: PixelMode::Replace,
                }
            }
        );

        Ok(())
    }

    #[test]
    fn test_mapped_load() -> Errorable {
        let mut c = Canvas::new();
        c.add_machine()?;
        c.add_built_in_block(Memory {
            values: vec![20, 40],
            auto_reset: false,
        })?;
        c.connect(port(0, 0), port(1, 0))?;

        c.load_program(
            0,
            r"
            load 0x2000
            load 0x2001
        ",
        )?;

        c.seq.ready();
        c.tick(3)?;

        assert_eq!(c.seq.get(0).unwrap().mem.read_stack(2), [20, 40]);
        Ok(())
    }
}
