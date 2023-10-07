pub mod cli;

pub use crate::cli::*;

use std::{io};
use opcodes_to_algorithms::{Execute, Machine};

fn main() -> Result<(), io::Error> {
    let source = read_input()?;
    let mut m: Machine = (*source).into();
    m.run();

    println!("{:?}", m.mem.read_stack(10));
    Ok(())
}

