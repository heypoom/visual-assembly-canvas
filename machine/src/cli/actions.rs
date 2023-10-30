use std::fs;
use crate::binary::bytes::{u16_vec_to_u8, u8_vec_to_u16};
use crate::{Execute, Machine};
use crate::cli::CLIError;
use crate::cli::CLIError::{CannotParse, CannotWriteToFile, RunFailed};
use crate::compile::compile_to_binary;
use crate::run::load_from_binary;

type Errorable = Result<(), CLIError>;

pub fn compile_to_file(src_path: &str, out_path: &str) -> Errorable {
    let source = fs::read_to_string(&src_path).expect("cannot read file");

    match compile_to_binary(&source) {
        Ok(bytecode) => {
            let bytes = u16_vec_to_u8(bytecode);
            if let Err(_) = fs::write(out_path, bytes) {
                return Err(CannotWriteToFile);
            }

            Ok(())
        }
        Err(error) => {
            return Err(CannotParse { error });
        }
    }
}

pub fn run_from_binary_file(path: &str, is_debug: bool) -> Errorable {
    let bytes = fs::read(path).expect("cannot read bytecode file");

    let mut m = load_from_binary(&u8_vec_to_u16(bytes));
    m.is_debug = is_debug;

    if let Err(error) = m.run() {
        return Err(RunFailed { error });
    }

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }

    Ok(())
}

pub fn run_from_source(path: &str, is_debug: bool) -> Errorable {
    let source = fs::read_to_string(path).expect("cannot read source file");

    let m: Result<Machine, _> = (*source).try_into();

    let mut m = match m {
        Ok(m) => m,
        Err(error) => return Err(CannotParse { error }),
    };

    m.is_debug = is_debug;

    if let Err(error) = m.run() {
        return Err(RunFailed { error });
    }

    if is_debug {
        println!("stack: {:?}", m.mem.read_stack(10));
    }

    Ok(())
}

