extern crate proc_macro;
use proc_macro::TokenStream;

mod strings;
mod enums;

mod arity;
mod name_to_instruction;
mod insert_arg;

use arity::insert_arity_method;
use name_to_instruction::insert_name_to_instruction_method;
use insert_arg::insert_arg_method;

#[proc_macro_derive(Arity)]
pub fn derive_arity(input: TokenStream) -> TokenStream {
    insert_arity_method(input)
}

#[proc_macro_derive(NameToInstruction)]
pub fn derive_name_to_instruction(input: TokenStream) -> TokenStream {
    insert_name_to_instruction_method(input)
}

#[proc_macro_derive(InsertArgs)]
pub fn derive_insert_args(input: TokenStream) -> TokenStream {
    insert_arg_method(input)
}
