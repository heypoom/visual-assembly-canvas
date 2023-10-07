use std::{env, io};
use std::fs::File;
use std::io::Read;
use opcodes_to_algorithms::{Execute, Machine};

fn read_input() -> Result<String, io::Error> {
    let args: Vec<String> = env::args().collect();

    if args.len() > 1 {
        let path = args.get(1).unwrap();
        let mut file = File::open(path)?;
        let mut content = String::new();
        file.read_to_string(&mut content)?;

        return Ok(content);
    }

    let mut content = String::new();
    io::stdin().read_to_string(&mut content)?;

    Ok(content)
}

fn main() -> Result<(), io::Error> {
    let source = read_input()?;

    let mut m: Machine = (&*source).into();
    m.run();

    println!("{:?}", m.mem.read_stack(10));
    Ok(())
}

