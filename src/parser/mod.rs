#[derive(Debug)]
pub struct Scanner {
    pub source: String,
    pub tokens: Vec<Token>,

    pub start: usize,
    pub current: usize,
    pub line: usize,
}

fn is_identifier(c: char) -> bool {
    c.is_alphanumeric() || c == '_'
}

#[derive(Debug)]
pub enum TokenType {
    /// Label definition ends with a colon, such as "start:"
    LabelDefinition,

    /// Instruction starts a line, such as "push"
    Instruction,

    /// Value in hex or decimal format, such as "0xFFFF" or "15"
    Value(u16),

    /// Name of the label, such as "start"
    Label,
}

#[derive(Debug)]
pub struct Token {
    pub token_type: TokenType,
    pub lexeme: String,
    pub line: usize,
}

impl Scanner {
    pub fn new(src: &str) -> Scanner {
        Scanner {
            source: src.into(),
            tokens: vec![],

            start: 0,
            current: 0,
            line: 0,
        }
    }

    fn peek(&self) -> char {
        self.source.chars().nth(self.current).expect("cannot peek at char")
    }

    fn is_end(&self) -> bool {
        self.current >= self.source.len()
    }

    fn advance(&mut self) -> char {
        let v = self.peek();
        self.current += 1;
        v
    }

    fn scan_token(&mut self) {
        let c = self.advance();

        match c {
            ' ' | '\r' | '\t' => {}

            '\n' => {
                self.line += 1;
            }

            // Parse hexadecimals.
            c if c == '0' => {
                match self.advance() {
                    'x' => {
                        self.advance();
                        self.hex()
                    }

                    'b' => {
                        self.advance();
                        self.binary_digit()
                    }

                    _ => {
                        self.digit()
                    }
                }
            }

            // Parse decimals.
            c if c.is_digit(10) => self.digit(),

            // Parse identifiers.
            c if is_identifier(c) => self.identifier(),

            _ => {}
        }
    }

    fn digit(&mut self) {
        while self.peek().is_digit(10) {
            self.advance();
        }

        let num = self.peek_lexeme().parse::<u16>().expect("invalid decimal");
        self.add_token(TokenType::Value(num));
    }


    fn hex(&mut self) {
        while self.peek().is_digit(16) {
            self.advance();
        }

        let text = self.peek_lexeme();
        let hex_str = text.strip_prefix("0x").expect("no hex prefix");
        let num = u16::from_str_radix(hex_str, 16).expect("invalid hex");
        self.add_token(TokenType::Value(num));
    }

    fn binary_digit(&mut self) {
        while self.peek().is_digit(2) {
            self.advance();
        }

        let text = self.peek_lexeme();
        let hex_str = text.strip_prefix("0b").expect("no binary prefix");
        let num = u16::from_str_radix(hex_str, 2).expect("invalid binary");
        self.add_token(TokenType::Value(num));
    }

    fn scan_tokens(&mut self) {
        while !self.is_end() {
            self.start = self.current;
            self.scan_token()
        }
    }

    fn identifier(&mut self) {
        while is_identifier(self.peek()) {
            self.advance();
        }

        match self.peek() {
            ':' => {
                self.advance();
                self.add_token(TokenType::LabelDefinition);
            }

            _ => {
                self.add_token(TokenType::Instruction);
            }
        }
    }

    fn add_token(&mut self, t: TokenType) {
        self.tokens.push(Token {
            token_type: t,
            lexeme: self.peek_lexeme(),
            line: self.line,
        });
    }

    fn peek_lexeme(&self) -> String {
        self.source[self.start..self.current].to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parser() {
        let source = r"
        jump start

        add_pattern:
            push 0xAA
            push 0b1011
            push 01024
            return

        start:
            call add_pattern
            call add_pattern
        ";

        let mut scanner = Scanner::new(source);
        scanner.scan_tokens();

        for token in scanner.tokens {
            println!("{:?}: '{}'", token.token_type, token.lexeme);
        }
    }
}