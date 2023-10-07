extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{quote};
use syn::{parse_macro_input, Data, DeriveInput, Fields};

pub fn insert_arity_method(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);

    // Ensure that the input is an enum
    if let Data::Enum(data_enum) = &ast.data {
        let enum_name = &ast.ident;

        // Extract the enum variants.
        let arity_values = data_enum.variants.iter().map(|variant| {
            // Extract the arity of the variant fields.
            let field_count = match &variant.fields {
                Fields::Unnamed(fields) => fields.unnamed.len(),

                // The variant fields does not exist. Arity is zero.
                _ => 0,
            };

            // Extract the variant's identifier.
            let variant_ident = &variant.ident;

            // If the arity is zero, match against the variant identifier, e.g. `Foo::Bar => 0`
            if field_count == 0 {
                return quote! {
                    #enum_name::#variant_ident => 0
                };
            }

            // Otherwise, match against the fields as well, e.g. `Foo::Baz(..) => 2`
            quote! {
                #enum_name::#variant_ident(..) => #field_count
            }
        });

        // Insert the arity method into the enum.
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