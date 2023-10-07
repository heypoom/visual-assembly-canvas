use std::io;
use std::io::Read;

pub fn read_from_stdin() -> Result<String, io::Error> {
    let mut content = String::new();
    io::stdin().read_to_string(&mut content)?;

    Ok(content)
}
