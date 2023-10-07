#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Instruction as I, WithStringManager};

    /// Loads string manually using the Load instruction.
    /// Note that the LoadString instruction is a more convenient alternative.
    #[test]
    fn test_load_string_manually() {
        let msg = "hello";
        let mut ops: Vec<I> = vec![];

        let mut m = Machine::new();
        let h_addr = m.mem.string().add_str(msg);

        for i in h_addr..h_addr + msg.len() as u16 {
            ops.push(I::Load(i));
        }

        m.mem.load_code(ops);
        assert_eq!(m.mem.read_stack(5), [0, 0, 0, 0, 0]);

        m.run();
        assert_eq!(m.mem.read_stack(5), [104, 101, 108, 108, 111]);
    }
}
