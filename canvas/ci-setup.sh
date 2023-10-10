#!/usr/bin/env bash

# Exit on error
set -e

# Install Rust and Cargo using rustup
if command -v rustc &>/dev/null
then
  echo "rustc already is installed."
else
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  echo "rustup is installed"
fi

# Source the cargo environment if that exists
if [ -e $HOME/.cargo/env ]
then
  echo "sourcing cargo/env"
  source $HOME/.cargo/env
fi

# Add WebAssembly target
if command -v rustup &>/dev/null
then
  echo "setting up webassembly target"
  rustup target add wasm32-unknown-unknown
else
  echo "rustup command not found, not adding webassembly target!"
fi

# Setup rsw
if command -v rsw &>/dev/null
then
  echo "rsw already is installed."
else
  # Install the `rsw` tool using Cargo
  cargo install rsw
fi

rsw --version

# Setup wasm-pack
if command -v wasm-pack &>/dev/null
then
  echo "wasm-pack is installed."
else
  # Install the `wasm-pack` tool using Cargo
  cargo install wasm-pack
fi