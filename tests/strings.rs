#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Op as I, WithStringManager};

    /// Loads string manually using the Load instruction.
    /// Note that the LoadString instruction is a more convenient alternative.
    #[test]
    fn test_load_string_manually() {
        let msg = "hello";
        let mut ops: Vec<I> = vec![];

        let mut m = Machine::new();
        let msg_ptr = m.mem.string().add_str(msg);

        for addr in msg_ptr..msg_ptr + msg.len() as u16 {
            ops.push(I::Load(addr));
        }

        m.mem.load_code(ops);
        assert_eq!(m.mem.read_stack(5), [0, 0, 0, 0, 0]);

        m.run();
        assert_eq!(m.mem.read_stack(5), [104, 101, 108, 108, 111]);
    }
}
