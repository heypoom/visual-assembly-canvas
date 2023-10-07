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

#[proc_macro_derive(NameToInstruction)]
pub fn match_instruction(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);

    let enum_name = &ast.ident;

    let variant_names: Vec<String> = match ast.data {
        // Extract the variant names and convert them to lowercase camel-case.
        Data::Enum(data_enum) => {
            data_enum.variants.iter().map(|variant| {
                let id = &variant.ident;
                let id_str = id.to_string();
                let first_char = id_str.chars().next().unwrap();
                let mut camel_case = first_char.to_lowercase().to_string();
                camel_case.push_str(&id_str[1..]);
                camel_case
            }).collect()
        }
        _ => {
            panic!("NameToInstruction can only be derived for enums!");
        }
    };

    // Generate the match arms.
    let match_arms = variant_names.iter().map(|variant_name| {
        let variant = &variant_name;

        quote! {
            stringify!(#variant) => #enum_name::#variant_name,
        }
    });

    // Generate the final code with the match arms.
    let stream = quote! {
        impl #enum_name {
            fn from_name(op: &str) -> #enum_name {
                match op.trim() {
                    #(#match_arms)*
                    _ => {},
                }
            }
        }
    };

    // Return the generated code as a TokenStream.
    TokenStream::from(stream)
}