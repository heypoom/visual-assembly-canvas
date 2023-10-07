use super::token::*;

#[derive(Debug)]
pub struct Scanner {
    pub source: String,
    pub tokens: Vec<Token>,

    pub start: usize,
    pub current: usize,
    pub line: usize,

    pub in_instruction: bool,
}

impl Scanner {
    pub fn new(src: &str) -> Scanner {
        Scanner {
            source: src.into(),
            tokens: vec![],

            start: 0,
            current: 0,
            line: 0,

            in_instruction: false,
        }
    }

    pub fn scan_tokens(&mut self) {
        while !self.is_end() {
            self.start = self.current;
            self.scan_token()
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

            // Comments
            ';' => {
                while self.peek() != '\n' {
                    self.advance();
                }
            }

            '\n' => {
                self.line += 1;
                self.in_instruction = false;
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

    fn identifier(&mut self) {
        while is_identifier(self.peek()) {
            self.advance();
        }

        match self.peek() {
            ':' => {
                self.advance();
                self.add_token(TokenType::LabelDefinition);
            }

            _ if !self.in_instruction => {
                self.add_token(TokenType::Instruction);
                self.in_instruction = true;
            }

            _ => {
                self.add_token(TokenType::Identifier);
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
