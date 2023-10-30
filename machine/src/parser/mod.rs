pub mod token;
pub mod scanner;
pub mod symbols;
pub mod parse_error;

pub use token::*;
pub use scanner::*;
pub use symbols::*;
pub use parse_error::*;

use std::str::FromStr;
use TokenType as T;
use crate::{DATA_START, Op};
use crate::ParseError::{CannotPeekAtToken, DuplicateLabelDefinition, DuplicateStringDefinition, InvalidArgToken, InvalidArgument, InvalidByteValue, InvalidIdentifier, InvalidInstruction, InvalidLabelDescription, InvalidStringValue, UndefinedSymbols};

type Errorable = Result<(), ParseError>;

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
        let scanner: Result<Scanner, _> = source.try_into();
        let scanner = scanner.expect("failed to scan tokens!");

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

    pub fn parse(&mut self) -> Errorable {
        // Pass 1: collect labels.
        self.parse_tokens()?;

        // Pass 2: collect op with memory offsets in labels.
        self.parse_tokens()?;

        Ok(())
    }

    pub fn parse_tokens(&mut self) -> Errorable {
        // Reset the parser state.
        self.current = 0;
        self.code_offset = 0;
        self.data_offset = 0;
        self.ops.clear();

        // Parse each token.
        while self.current < self.tokens.len() {
            let token = self.peek()?;
            self.parse_token(&token.clone())?;
        }

        // Mark symbol scanning phase to be completed.
        if !self.symbol_scanned {
            self.symbol_scanned = true;
        }

        Ok(())
    }

    fn parse_token(&mut self, token: &Token) -> Errorable {
        match token.token_type {
            T::LabelDefinition => self.save_label(token)?,
            T::Instruction => self.save_instruction(token)?,
            T::StringDefinition => self.save_string()?,
            T::ValueDefinition => self.save_value()?,
            T::Identifier => {}
            T::String(..) => {}
            T::Value(..) => {}
            T::Eof => {}
        }

        self.current += 1;

        Ok(())
    }

    fn advance(&mut self) {
        if self.current >= self.tokens.len() - 1 {
            println!("cannot advance! {} >= {}", self.current, self.tokens.len());
            return;
        }

        self.current += 1;
    }

    fn save_label(&mut self, token: &Token) -> Errorable {
        // Do not process labels if the label is already scanned in the first pass.
        if self.symbol_scanned { return Ok(()); }

        let key = token.lexeme.clone();
        let Some(key) = key.trim().strip_suffix(":") else {
            return Err(InvalidLabelDescription);
        };

        // Abort if the label already exists.
        // TODO: warn the user if they defined duplicate labels!
        if self.symbols.offsets.contains_key(key) {
            return Err(DuplicateLabelDefinition);
        }

        // Define labels based on the token.
        let offset = self.code_offset;
        self.symbols.offsets.insert(key.to_owned(), offset);

        Ok(())
    }

    fn identifier_name(&self) -> Result<String, ParseError> {
        match self.peek() {
            Ok(Token { token_type: TokenType::Identifier, lexeme, .. }) => Ok(lexeme.into()),
            _ => Err(InvalidIdentifier),
        }
    }

    fn peek(&self) -> Result<&Token, ParseError> {
        match self.tokens.get(self.current) {
            Some(token) => Ok(token),
            None => Err(CannotPeekAtToken),
        }
    }

    fn string_value(&self) -> Result<String, ParseError> {
        match self.peek() {
            Ok(Token { token_type: TokenType::String(value), .. }) => Ok(value.into()),
            _ => Err(InvalidStringValue),
        }
    }

    fn byte_value(&self) -> Result<u16, ParseError> {
        match self.peek() {
            Ok(Token { token_type: TokenType::Value(value), .. }) => Ok(*value),
            _ => Err(InvalidByteValue),
        }
    }

    fn symbol(&mut self) -> Result<Option<String>, ParseError> {
        // Do not process if the symbol is already scanned in the first pass.
        if self.symbol_scanned { return Ok(None); }

        self.advance();
        let key = self.identifier_name()?;

        // Abort if the string is already defined.
        // TODO: warn the user if they defined strings with the same name!
        if self.symbols.offsets.contains_key(&key) { return Ok(None); }
        self.symbols.offsets.insert(key.clone(), self.data_offset);

        self.advance();
        self.data_offset += 1;

        Ok(Some(key))
    }

    fn save_string(&mut self) -> Errorable {
        let key = match self.symbol() {
            Ok(Some(key)) => key,
            Ok(None) => return Ok(()),
            _ => return Err(InvalidIdentifier),
        };

        // The same string is defined twice.
        if self.symbols.strings.contains_key(&key) { return Err(DuplicateStringDefinition); }

        let value = self.string_value()?;
        let len = value.len() as u16;
        self.data_offset += len;

        self.symbols.strings.insert(key.clone(), value);

        Ok(())
    }

    fn save_value(&mut self) -> Errorable {
        let key = match self.symbol() {
            Ok(Some(key)) => key,
            Ok(None) => return Ok(()),
            _ => return Err(InvalidIdentifier),
        };

        self.symbols.data.insert(key.clone(), vec![self.byte_value()?]);
        self.data_offset += 1;

        Ok(())
    }

    fn save_instruction(&mut self, token: &Token) -> Errorable {
        // Build the instruction from token.
        let op_str = token.lexeme.clone();

        let Ok(op) = self.instruction(&op_str) else {
            return Err(InvalidInstruction);
        };

        let arity = op.arity() as u16;

        if op == Op::Noop { return Ok(()); }

        self.ops.push(op);
        self.code_offset += arity + 1;

        Ok(())
    }

    fn instruction(&mut self, op_str: &str) -> Result<Op, ParseError> {
        let mut invalid_arg = false;

        let arg_fn = || {
            match self.arg() {
                Ok(value) => value,

                // TODO: invalid arguments must throw an error!
                Err(error) => {
                    println!("invalid argument! {:?}", error);
                    invalid_arg = true;
                    0x00
                }
            }
        };

        let Ok(op) = Op::from_str(op_str) else {
            return Err(InvalidInstruction);
        };

        let op = op.with_arg(arg_fn);
        if invalid_arg { return Err(InvalidArgument); }

        Ok(op)
    }

    fn arg(&mut self) -> Result<u16, ParseError> {
        self.advance();

        match self.peek() {
            Ok(Token { token_type: TokenType::Value(v), .. }) => Ok(*v),
            Ok(token) if token.token_type == TokenType::Identifier => Ok(self.op_arg(&token.clone())?),
            _ => Err(InvalidArgToken)
        }
    }

    /// Return the memory offset of the label.
    fn op_arg(&mut self, token: &Token) -> Result<u16, ParseError> {
        // Return a placeholder for the scanning phase.
        if !self.symbol_scanned { return Ok(0x00); }

        let key = token.lexeme.trim();
        let Some(offset) = self.symbols.offsets.get(key) else {
            return Err(InvalidIdentifier);
        };

        // Strings should be loaded from the data segment.
        if self.symbols.strings.contains_key(key) {
            return Ok(DATA_START + *offset);
        }

        // Raw bytes are loaded directly into the code segment.
        if self.symbols.data.contains_key(key) {
            let Some(value) = self.symbols.data.get(key) else {
                return Err(UndefinedSymbols);
            };

            return match value.get(0) {
                Some(v) => Ok(*v),
                None => Err(UndefinedSymbols)
            };
        }

        // Labels stores the offsets within the code segment.
        Ok(*offset)
    }
}

impl TryFrom<&str> for Parser {
    type Error = ParseError;

    fn try_from(source: &str) -> Result<Self, Self::Error> {
        let mut p = Parser::new(source);
        p.parse()?;
        Ok(p)
    }
}
