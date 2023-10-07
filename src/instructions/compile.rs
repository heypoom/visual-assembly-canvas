use crate::Op;

pub fn compile(ops: Vec<Op>) -> Vec<u16> {
    let mut bytecode = vec![];

    for op in ops {
        bytecode.push(op.opcode());
        bytecode.extend(op.field_values());
    }

    bytecode.push(Op::Eof.opcode());
    bytecode
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compile() {
        let m = compile(vec![Op::Push(5), Op::Push(10)]);
        assert_eq!(m[0..4], [0x01, 5, 0x01, 10])
    }
}
