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

    /// Instructions
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
        for token in self.tokens.clone() {
            self.parse_token(&token)
        }
    }

    fn parse_token(&mut self, token: &Token) {
        match token.token_type {
            T::LabelDefinition => {
                self.symbols.labels.insert(token.lexeme.clone(), self.opcode_offset);
            }
            T::Instruction => {
                // Terminates the previous instruction.
                if self.op != "" {
                    self.opcode_offset += 1 + self.args.len();

                    let op = self.instruction();
                    self.instructions.push(op);
                }

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
        println!("{}({:?})", self.op, self.args);

        match self.op.as_str() {
            "push" => {
                I::Push(self.arg())
            }
            "jump" => {
                I::Jump(self.arg())
            }
            "return" => {
                I::Return
            }
            "call" => {
                I::Call(self.arg())
            }
            _ => I::None
        }
    }
}

