#[cfg(test)]
mod match_instruction_str_tests {
    use poom_macros::NameToInstruction;

    #[derive(NameToInstruction)]
    enum Instruction {
        Push(u16),
        Pop,
        LoadString(u16),
    }


    #[test]
    fn test_instruction() {
        assert_eq!(Instruction::from_name("push"), Instruction::Push);
    }
}
