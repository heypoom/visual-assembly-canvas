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

        let arity_values = data_enum.variants.iter().map(|variant| {
            let field_count = match &variant.fields {
                Fields::Unnamed(fields) => fields.unnamed.len(),
                _ => 0,
            };

            let variant_ident = &variant.ident;

            if field_count == 0 {
                return quote! {
                    #enum_name::#variant_ident => 0
                };
            }

            quote! {
                #enum_name::#variant_ident(..) => #field_count
            }
        });

        let expanded = quote! {
            impl #enum_name {
                pub fn arity(&self) -> usize {
                    match self {
                        #(#arity_values,)*
                    }
                }
            }
        };

        expanded.into()
    } else {
        panic!("Arity can only be derived for enums");
    }
}
