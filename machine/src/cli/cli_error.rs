use crate::{ParseError, RuntimeError};
use snafu::prelude::*;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub))]
pub enum CLIError {
    #[snafu(display(""))]
    IncorrectMagicBytes,

    #[snafu(display(""))]
    IncorrectFileHeader,

    #[snafu(display(""))]
    CannotReadFile,

    #[snafu(display(""))]
    CannotParse { error: ParseError },

    #[snafu(display(""))]
    CannotReadBytecode,

    #[snafu(display(""))]
    CannotWriteToFile,

    #[snafu(display(""))]
    RunFailed { error: RuntimeError },
}
