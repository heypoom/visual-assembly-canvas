extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{quote};
use syn::{parse_macro_input, Data, DeriveInput, Fields};

#[proc_macro_derive(Arity)]
pub fn derive_arity(input: TokenStream) -> TokenStream {
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

fn to_snake_case(input: &str) -> String {
    let mut snake_case = String::new();
    let mut last_char_was_upper = false;

    for (i, c) in input.chars().enumerate() {
        if i > 0 && c.is_uppercase() {
            if !last_char_was_upper {
                snake_case.push('_');
            }
            snake_case.push(c.to_lowercase().next().unwrap());
            last_char_was_upper = true;
        } else {
            snake_case.push(c.to_lowercase().next().unwrap());
            last_char_was_upper = false;
        }
    }

    snake_case
}

#[proc_macro_derive(NameToInstruction)]
pub fn derive_name_to_instruction(input: TokenStream) -> TokenStream {
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

            // Convert the identifier to lower_snake_case.
            let snake_case = to_snake_case(&variant_ident.to_string());

            // If the arity is zero, match against the variant identifier, e.g. `Foo::Bar => 0`
            if field_count == 0 {
                return quote! {
                    #snake_case => #enum_name::#variant_ident
                };
            }

            // Retrieve the arguments by using the arg_fn mutable closure.
            // We use Rc<RefCell>> to allow the closure to be called multiple times.
            let args = (0..field_count).map(|_| quote! {
                {
                    let arg_fn = arg_fn.clone();
                    let mut arg_fn = arg_fn.borrow_mut();
                    arg_fn()
                }
            });

            // Otherwise, match against the fields as well, e.g. `Foo::Baz(..) => 2`
            quote! {
                #snake_case => #enum_name::#variant_ident(
                    #(#args,)*
                )
            }
        });

        // Insert the arity method into the enum.
        let expanded = quote! {
            use std::rc::Rc;
            use std::cell::RefCell;

            impl #enum_name {
                pub fn from_name<F>(name: &str, arg_fn: F) -> #enum_name where F: FnMut() -> u16 {
                    let arg_fn = Rc::new(RefCell::new(arg_fn));

                    match name {
                        #(#arity_values,)*
                        _ => panic!("unknown instruction: {}", name),
                    }
                }
            }
        };

        expanded.into()
    } else {
        panic!("NameToInstruction can only be derived for enums");
    }
}