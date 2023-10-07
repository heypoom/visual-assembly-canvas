mod token;
mod scanner;
mod symbols;

pub use token::*;
pub use scanner::*;
pub use symbols::*;

use TokenType as T;
use crate::Instruction as I;

#[derive(Clone)]
pub struct Parser {
    /// Input tokens
    tokens: Vec<Token>,

    /// Symbols
    pub symbols: Symbols,
    pub instructions: Vec<I>,

    /// Current operation
    op: String,

    /// Current arguments
    args: Vec<u16>,

    /// Current opcode offsets
    opcode_offset: usize,
}

impl Parser {
    pub fn new(source: &str) -> Parser {
        let mut scanner = Scanner::new(source);
        scanner.scan_tokens();

        Parser {
            tokens: scanner.tokens,
            instructions: vec![],
            symbols: Symbols::new(),
            opcode_offset: 0,
            op: "".into(),
            args: vec![],
        }
    }

    pub fn parse(&mut self) {
        // Pass 1: collect labels.
        self.parse_tokens();

        // Pass 2: collect instructions with memory offsets in labels.
        self.parse_tokens();
    }

    pub fn parse_tokens(&mut self) {
        self.op = "".into();
        self.opcode_offset = 0;
        self.instructions = vec![];

        for token in self.tokens.clone() {
            self.parse_token(&token)
        }
    }

    fn parse_token(&mut self, token: &Token) {
        match token.token_type {
            T::LabelDefinition => {
                let key = token.lexeme.clone();
                let key = key.trim().strip_suffix(":").expect("label definition should end with :");

                // Define labels based on the token.
                if !self.symbols.labels.contains_key(key) {
                    let offset = self.opcode_offset;
                    self.symbols.labels.insert(key.to_owned(), offset);
                }
            }

            T::Instruction => {
                // Resolves the previous instruction.
                let op = self.instruction();

                // Process the opcodes
                if op != I::None {
                    self.instructions.push(op);
                    self.opcode_offset += op.arity() + 1;
                }

                // Processes next instructions
                self.op = token.lexeme.clone();
                self.args = vec![];
            }

            T::Value(value) => {
                self.args.push(value);
            }
            T::Identifier => {
                let word = token.lexeme.trim();

                if let Some(addr) = self.symbols.labels.get(word) {
                    self.args.push(*addr as u16);
                } else {
                    self.args.push(0x00);
                }
            }
        }
    }

    fn arg(&mut self) -> u16 {
        self.args.pop().expect(&format!("missing arg for {}", self.op))
    }

    fn instruction(&mut self) -> I {
        match self.op.as_str() {
            "push" => I::Push(self.arg()),
            "jump" => I::Jump(self.arg()),
            "return" => I::Return,
            "call" => I::Call(self.arg()),
            "halt" => I::Halt,
            _ => I::None
        }
    }
}

