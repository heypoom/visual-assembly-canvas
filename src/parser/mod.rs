mod token;
mod scanner;
mod symbols;

pub use token::*;
pub use scanner::*;
pub use symbols::*;

use TokenType as T;
use crate::{Instruction as I};

#[derive(Clone)]
pub struct Parser {
    /// Input a set of tokens.
    tokens: Vec<Token>,

    /// Output a set of instructions.
    pub instructions: Vec<I>,

    /// Output a set of symbols.
    pub symbols: Symbols,

    /// Is the first pass of label scanning completed?
    label_scanned: bool,

    /// Current token index.
    current: usize,

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

            label_scanned: false,
            current: 0,
            opcode_offset: 0,
        }
    }

    pub fn parse(&mut self) {
        // Pass 1: collect labels.
        self.parse_tokens();

        // Pass 2: collect instructions with memory offsets in labels.
        self.parse_tokens();
    }

    pub fn parse_tokens(&mut self) {
        // Reset the parser state.
        self.current = 0;
        self.opcode_offset = 0;
        self.instructions = vec![];

        // Parse each token.
        while self.current < self.tokens.len() {
            let token = self.tokens.get(self.current).expect("missing token");
            self.parse_token(&token.clone());
        }

        // Mark label scanning pass to be completed.
        if !self.label_scanned {
            self.label_scanned = true;
        }
    }

    fn parse_token(&mut self, token: &Token) {
        match token.token_type {
            T::LabelDefinition => self.save_label(token),
            T::Instruction => self.save_instruction(token),
            T::Value(..) => {}
            T::Identifier => {}
            T::StringDefinition => {}
        }

        self.current += 1;
    }

    fn identifier(&mut self, token: &Token) -> u16 {
        // Return a placeholder for the scanning phase.
        if !self.label_scanned { return 0x00; }

        let label = token.lexeme.trim();

        *self.symbols.labels.get(label).expect("unknown label") as u16
    }

    fn advance(&mut self) {
        self.current += 1;
    }

    fn save_label(&mut self, token: &Token) {
        // Do not process labels if the label is already scanned in the first pass.
        if self.label_scanned { return; }

        let key = token.lexeme.clone();
        let key = key.trim().strip_suffix(":").expect("label definition should end with :");

        // Abort if the label already exists.
        // TODO: warn the user if they defined duplicate labels!
        if self.symbols.labels.contains_key(key) { return; }

        // Define labels based on the token.
        let offset = self.opcode_offset;
        self.symbols.labels.insert(key.to_owned(), offset);
    }

    fn save_instruction(&mut self, token: &Token) {
        // Build the instruction from token.
        let op_str = token.lexeme.clone();
        let op = self.instruction(&op_str);
        let arity = op.arity();

        if op == I::Noop { return; }

        self.instructions.push(op);
        self.opcode_offset += arity + 1;
    }

    fn instruction(&mut self, op: &str) -> I {
        // TODO: generate this via a procedural macro instead!
        match op.trim() {
            "push" => I::Push(self.arg()),
            "jump" => I::Jump(self.arg()),
            "return" => I::Return,
            "call" => I::Call(self.arg()),
            "halt" => I::Halt,
            "noop" => I::Noop,
            "pop" => I::Pop,
            "load_string" => I::LoadString(self.arg()),
            "load" => I::Load(self.arg()),
            "store" => I::Store(self.arg()),
            "dup" => I::Dup,
            "swap" => I::Swap,
            "over" => I::Over,
            "inc" => I::Inc,
            "dec" => I::Dec,
            "add" => I::Add,
            "sub" => I::Sub,
            "mul" => I::Mul,
            "div" => I::Div,
            "jump_zero" => I::JumpZero(self.arg()),
            "jump_not_zero" => I::JumpNotZero(self.arg()),
            "equal" => I::Equal,
            "not_equal" => I::NotEqual,
            "less_than" => I::LessThan,
            "less_than_or_equal" => I::LessThanOrEqual,
            "greater_than" => I::GreaterThan,
            "greater_than_or_equal" => I::GreaterThanOrEqual,
            "print" => I::Print,
            "eof" => I::EOF,
            _ => I::Noop
        }
    }

    fn arg(&mut self) -> u16 {
        self.advance();

        let token = self.tokens.get(self.current).expect("missing argument token");

        match token.token_type {
            TokenType::Value(v) => v,
            TokenType::Identifier => self.identifier(&token.clone()),
            _ => 0x00
        }
    }
}

impl From<&str> for Parser {
    fn from(source: &str) -> Self {
        let mut p = Parser::new(source);
        p.parse();
        p
    }
}
