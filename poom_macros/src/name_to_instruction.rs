extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{quote};
use syn::{parse_macro_input, Data, DeriveInput};

use crate::strings::to_snake_case;
use crate::enums::variant_arity;

pub fn insert_name_to_instruction_method(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);

    // Ensure that the input is an enum
    if let Data::Enum(data_enum) = &ast.data {
        let enum_name = &ast.ident;

        // Transform the match arms
        let match_arms = data_enum.variants.iter().map(|variant| {
            let field_count = variant_arity(variant);

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
                        #(#match_arms,)*
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
