extern crate machine;

use clap::Parser;
use machine::cli::{compile_to_file, run_from_binary_file, run_from_source, Args, Commands};

fn main() {
    let args = Args::parse();

    let result = match args.command {
        Some(Commands::Compile { src, out }) => compile_to_file(&src, &out),
        Some(Commands::Run {
                 path,
                 from_source,
                 debug,
             }) => {
            if from_source {
                run_from_source(&path, debug)
            } else {
                run_from_binary_file(&path, debug)
            }
        },
        None => Ok(())
    };

    if let Err(error) = result {
        println!("Command line error: {:?}", error);
    }
}
