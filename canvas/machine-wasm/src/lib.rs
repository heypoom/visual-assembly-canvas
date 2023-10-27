extern crate console_error_panic_hook;

mod controller;
mod utils;

use std::panic;
use wasm_bindgen::prelude::*;

pub use controller::Controller;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(text: &str);
}

// Called when the module is instantiated.
#[wasm_bindgen(start)]
pub fn setup_system() -> Result<(), JsValue> {
    // Setup panic hook.
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    Ok(())
}
