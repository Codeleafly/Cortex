pub mod stmt;
pub mod expr;

use nox_shared::{Token, TokenType};
use crate::ast::Stmt;

pub struct Parser {
    pub tokens: Vec<Token>,
    pub pos: usize,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, pos: 0 }
    }

    pub fn parse(&mut self) -> Vec<Stmt> {
        let mut statements = Vec::new();
        while !self.is_at_end() {
            statements.push(self.statement());
        }
        statements
    }

    pub fn match_token(&mut self, token_type: TokenType) -> bool {
        if self.check(token_type) {
            self.advance();
            true
        } else {
            false
        }
    }

    pub fn match_tokens(&mut self, types: &[TokenType]) -> bool {
        for t in types {
            if self.check(*t) {
                self.advance();
                return true;
            }
        }
        false
    }

    pub fn check(&self, token_type: TokenType) -> bool {
        if self.is_at_end() { false } else { self.peek().token_type == token_type }
    }

    pub fn advance(&mut self) -> &Token {
        if !self.is_at_end() { self.pos += 1; }
        self.previous()
    }

    pub fn is_at_end(&self) -> bool {
        self.peek().token_type == TokenType::EOF
    }

    pub fn peek(&self) -> &Token {
        &self.tokens[self.pos]
    }

    pub fn peek_next(&self) -> &Token {
        if self.pos + 1 >= self.tokens.len() {
            &self.tokens[self.tokens.len() - 1]
        } else {
            &self.tokens[self.pos + 1]
        }
    }

    pub fn previous(&self) -> &Token {
        &self.tokens[self.pos - 1]
    }

    pub fn consume(&mut self, token_type: TokenType, message: &str) -> &Token {
        if self.check(token_type) { self.advance() } else { panic!("{}", message) }
    }
}
