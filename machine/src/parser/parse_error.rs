use snafu::prelude::*;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub))]
pub enum ParseError {
    #[snafu(display("string is invalid"))]
    InvalidString,

    #[snafu(display("symbol is not defined"))]
    UndefinedSymbols,

    #[snafu(display("invalid identifier"))]
    InvalidIdentifier,

    #[snafu(display("instruction does not exist!"))]
    InvalidInstruction,

    #[snafu(display("label definition should end with :"))]
    InvalidLabelDescription,

    #[snafu(display("duplicate label definition"))]
    DuplicateLabelDefinition,

    #[snafu(display("invalid argument"))]
    InvalidArg,

    #[snafu(display("invalid argument token"))]
    InvalidArgToken,
}
