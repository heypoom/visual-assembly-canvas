extern crate proc_macro;

mod strings;
mod arity;
mod enums;
mod name_to_instruction;

use proc_macro::TokenStream;

use arity::insert_arity_method;
use name_to_instruction::insert_name_to_instruction_method;

#[proc_macro_derive(Arity)]
pub fn derive_arity(input: TokenStream) -> TokenStream {
    insert_arity_method(input)
}

#[proc_macro_derive(NameToInstruction)]
pub fn derive_name_to_instruction(input: TokenStream) -> TokenStream {
    insert_name_to_instruction_method(input)
}