mod token;
mod scanner;
mod symbols;

pub use token::*;
pub use scanner::*;
pub use symbols::*;

use std::str::FromStr;
use TokenType as T;
use crate::{DATA_START, Op};

#[derive(Clone)]
pub struct Parser {
    /// Input a set of tokens.
    tokens: Vec<Token>,

    /// Output a set of operations.
    pub ops: Vec<Op>,

    /// Output a set of symbols.
    pub symbols: Symbols,

    /// Is the first pass of symbol scanning completed?
    symbol_scanned: bool,

    /// Current token index.
    current: usize,

    /// Current opcode offsets
    code_offset: u16,

    /// Current data offsets
    data_offset: u16,
}

impl Parser {
    pub fn new(source: &str) -> Parser {
        let scanner: Scanner = source.into();

        Parser {
            tokens: scanner.tokens,
            ops: vec![],
            symbols: Symbols::new(),

            symbol_scanned: false,

            current: 0,
            code_offset: 0,
            data_offset: 0,
        }
    }

    pub fn parse(&mut self) {
        // Pass 1: collect labels.
        self.parse_tokens();

        // Pass 2: collect op with memory offsets in labels.
        self.parse_tokens();
    }

    pub fn parse_tokens(&mut self) {
        // Reset the parser state.
        self.current = 0;
        self.code_offset = 0;
        self.data_offset = 0;
        self.ops.clear();

        // Parse each token.
        while self.current < self.tokens.len() {
            let token = self.peek();
            self.parse_token(&token.clone());
        }

        // Mark symbol scanning phase to be completed.
        if !self.symbol_scanned {
            self.symbol_scanned = true;
        }
    }

    fn parse_token(&mut self, token: &Token) {
        match token.token_type {
            T::LabelDefinition => self.save_label(token),
            T::Instruction => self.save_instruction(token),
            T::StringDefinition => self.save_string(),
            T::ValueDefinition => self.save_value(),
            T::Identifier => {}
            T::String(..) => {}
            T::Value(..) => {}
            T::Eof => {}
        }

        self.current += 1;
    }

    fn advance(&mut self) {
        if self.current >= self.tokens.len() - 1 {
            return;
        }

        self.current += 1;
    }

    fn save_label(&mut self, token: &Token) {
        // Do not process labels if the label is already scanned in the first pass.
        if self.symbol_scanned { return; }

        let key = token.lexeme.clone();
        let key = key.trim().strip_suffix(":").expect("label definition should end with :");

        // Abort if the label already exists.
        // TODO: warn the user if they defined duplicate labels!
        if self.symbols.offsets.contains_key(key) { return; }

        // Define labels based on the token.
        let offset = self.code_offset;
        self.symbols.offsets.insert(key.to_owned(), offset);
    }

    fn identifier_name(&self) -> String {
        let token = self.peek();

        if token.token_type != TokenType::Identifier {
            panic!("token is not a valid identifier");
        }

        token.lexeme.clone()
    }

    fn peek(&self) -> &Token {
        self.tokens.get(self.current).expect(&format!("cannot peek at {}", self.current))
    }

    fn string_value(&self) -> String {
        let token = self.peek();

        if let TokenType::String(value) = token.token_type.clone() {
            return value;
        }

        panic!("missing string value!")
    }

    fn byte_value(&self) -> u16 {
        let token = self.peek();

        if let TokenType::Value(value) = token.token_type.clone() {
            return value;
        }

        panic!("missing value!")
    }

    fn symbol(&mut self) -> Option<String> {
        // Do not process if the symbol is already scanned in the first pass.
        if self.symbol_scanned { return None; }

        self.advance();
        let key = self.identifier_name();

        // Abort if the string is already defined.
        // TODO: warn the user if they defined strings with the same name!
        if self.symbols.offsets.contains_key(&key) { return None; }
        self.symbols.offsets.insert(key.clone(), self.data_offset);

        self.advance();
        self.data_offset += 1;

        Some(key)
    }

    fn save_string(&mut self) {
        let Some(key) = self.symbol() else { return; };
        if self.symbols.strings.contains_key(&key) { return; }

        let value = self.string_value();
        let len = value.len() as u16;
        self.data_offset += len;

        self.symbols.strings.insert(key.clone(), value);
    }

    fn save_value(&mut self) {
        let Some(key) = self.symbol() else { return; };

        self.symbols.data.insert(key.clone(), vec![self.byte_value()]);
        self.data_offset += 1;
    }

    fn save_instruction(&mut self, token: &Token) {
        // Build the instruction from token.
        let op_str = token.lexeme.clone();
        let op = self.instruction(&op_str);
        let arity = op.arity() as u16;

        if op == Op::Noop { return; }

        self.ops.push(op);
        self.code_offset += arity + 1;
    }

    fn instruction(&mut self, op: &str) -> Op {
        Op::from_str(op).expect("invalid instruction").with_arg(|| self.arg())
    }

    fn arg(&mut self) -> u16 {
        self.advance();
        let token = self.peek();

        match token.token_type {
            TokenType::Value(v) => v,
            TokenType::Identifier => self.op_arg(&token.clone()),
            _ => 0x00
        }
    }

    /// Return the memory offset of the label.
    fn op_arg(&mut self, token: &Token) -> u16 {
        // Return a placeholder for the scanning phase.
        if !self.symbol_scanned { return 0x00; }

        let key = token.lexeme.trim();
        let offset = *self.symbols.offsets.get(key).expect("invalid identifier");

        // Strings should be loaded from the data segment.
        if self.symbols.strings.contains_key(key) {
            return DATA_START + offset;
        }

        // Raw bytes are loaded directly into the code segment.
        if self.symbols.data.contains_key(key) {
            let value = self.symbols.data.get(key).unwrap();
            return *value.get(0).unwrap();
        }

        // Labels stores the offsets within the code segment.
        offset
    }
}

impl From<&str> for Parser {
    fn from(source: &str) -> Self {
        let mut p = Parser::new(source);
        p.parse();
        p
    }
}
