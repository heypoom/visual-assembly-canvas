use crate::{Instruction as I};

pub fn compile(ops: Vec<I>) -> Vec<u16> {
    let mut bytecode = vec![];

    for ins in ops {
        bytecode.push(ins.opcode());

        // Insert the arguments into memory.
        // TODO: this is very repetitive!
        if let I::LoadString(v) | I::Store(v) | I::Load(v) | I::JumpNotZero(v) | I::JumpZero(v) | I::Jump(v) | I::Push(v) | I::Call(v) = ins {
            bytecode.push(v)
        }
    }

    bytecode.push(I::EOF.opcode());
    bytecode
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compile() {
        let m = compile(vec![I::Push(5), I::Push(10)]);
        assert_eq!(m[0..4], [0x01, 5, 0x01, 10])
    }
}
