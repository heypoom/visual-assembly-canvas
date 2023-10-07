#[cfg(test)]
mod tests {
    extern crate opcodes_to_algorithms as O;

    use O::{Machine, Execute, Instruction as I, WithStringManager};

    #[test]
    fn test_load_str() {
        let mut m = Machine::new();
        let mut ms = m.mem.string();

        let s = "hello";
        let h_addr = ms.add_str(s);

        let mut ins: Vec<I> = vec![];

        for i in h_addr..h_addr + s.len() as u16 {
            ins.push(I::Load(i));
        }

        m.mem.load_code(ins);
        assert_eq!(m.mem.read_stack(5), [0, 0, 0, 0, 0]);

        m.run();
        assert_eq!(m.mem.read_stack(5), [104, 101, 108, 108, 111]);
    }
}
