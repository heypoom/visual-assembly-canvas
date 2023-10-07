extern crate proc_macro;

use proc_macro::TokenStream;

mod enums;

mod arity;
mod with_arg;
mod field_values;

use arity::insert_arity_method;
use with_arg::insert_arg_method;
use field_values::insert_field_values_method;

#[proc_macro_derive(Arity)]
pub fn derive_arity(input: TokenStream) -> TokenStream {
    insert_arity_method(input)
}

#[proc_macro_derive(InsertArgs)]
pub fn derive_with_args(input: TokenStream) -> TokenStream {
    insert_arg_method(input)
}

#[proc_macro_derive(FieldValues)]
pub fn derive_field_values(input: TokenStream) -> TokenStream {
    insert_field_values_method(input)
}
