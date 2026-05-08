use nox_shared::{TokenType, Token};
use crate::lexer_impl::Lexer;

impl Lexer {
    pub fn string_token(&mut self, quote: char) -> Token {
        let start_col = self.col;
        let start_line = self.line;
        self.advance(); // Skip opening quote
        let mut val = String::new();
        while !self.is_at_end() && self.peek() != quote {
            let c = self.advance();
            if c == '\\' {
                let next = self.advance();
                match next {
                    'n' => val.push('\n'),
                    'r' => val.push('\r'),
                    't' => val.push('\t'),
                    '\\' => val.push('\\'),
                    'e' => val.push('\x1b'),
                    '"' => val.push('"'),
                    '\'' => val.push('\''),
                    _ => { val.push('\\'); val.push(next); }
                }
            } else {
                val.push(c);
            }
        }
        self.advance(); // Skip closing quote
        Token::new(TokenType::STRING, Some(val), start_line, start_col)
    }

    pub fn number_token(&mut self) -> Token {
        let start_col = self.col;
        let start_line = self.line;
        let mut val = String::new();
        while !self.is_at_end() && self.peek().is_ascii_digit() {
            val.push(self.advance());
        }
        Token::new(TokenType::NUMBER, Some(val), start_line, start_col)
    }

    pub fn identifier_token(&mut self) -> Token {
        let start_col = self.col;
        let start_line = self.line;
        let mut val = String::new();
        while !self.is_at_end() && (self.peek().is_alphanumeric() || self.peek() == '_') {
            val.push(self.advance());
        }
        let token_type = self.keywords.get(&val).cloned().unwrap_or(TokenType::IDENTIFIER);
        Token::new(token_type, Some(val), start_line, start_col)
    }
}
