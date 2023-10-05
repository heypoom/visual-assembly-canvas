extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{quote};
use syn::{parse_macro_input, Data, DeriveInput, Fields};

#[proc_macro_derive(Arity)]
pub fn arity(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);


    // Ensure that the input is an enum
    if let Data::Enum(data_enum) = &ast.data {
        let enum_name = &ast.ident;

        let expanded = quote! {
            impl #enum_name {
                fn arity(&self) -> u32 {
                   1112
                }
            }
        };

        expanded.into()
    } else {
        panic!("Arity can only be derived for enums");
    }
}
