use snafu::prelude::*;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub))]
pub enum RuntimeError {
    #[snafu(display("stack underflow. pointer {top} is below {min}"))]
    StackUnderflow {
        top: u16,
        min: u16,
    },

    #[snafu(display("stack overflow. pointer {top} is above {max}"))]
    StackOverflow {
        top: u16,
        max: u16,
    },
}
