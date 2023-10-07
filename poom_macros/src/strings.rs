pub fn to_snake_case(input: &str) -> String {
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
