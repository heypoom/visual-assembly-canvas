#!/usr/bin/env bash

# Exit on error
set -e

# Install Rust and Cargo using rustup
if command -v rustc &>/dev/null
then
  echo "rustc already is installed."
else
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

  rustup install stable
  rustup target add wasm32-unknown-unknown
fi

rustc --version

# Source the cargo environment if that exists
if [ -e $HOME/cargo/env ]
then
  source $HOME/.cargo/env
fi

if command -v rsw &>/dev/null
then
  echo "rsw already is installed."
else
  # Install the `rsw` tool using Cargo
  cargo install rsw
fi

rsw --version
