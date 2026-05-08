use nox_shared::{TokenType, Token};
use crate::lexer_impl::Lexer;

impl Lexer {
    pub fn tokenize(&mut self) -> Vec<Token> {
        let mut tokens = Vec::new();
        while !self.is_at_end() {
            let c = self.peek();

            if c.is_whitespace() {
                if c == '\n' {
                    self.line += 1;
                    self.col = 1;
                }
                self.pos += 1;
                if c != '\n' { self.col += 1; }
                continue;
            }

            // Comments
            if c == '/' && self.peek_next() == '/' {
                while !self.is_at_end() && self.peek() != '\n' {
                    self.advance();
                }
                continue;
            }
            if c == '/' && self.peek_next() == '*' {
                self.advance(); // consume /
                self.advance(); // consume *
                while !self.is_at_end() && !(self.peek() == '*' && self.peek_next() == '/') {
                    if self.peek() == '\n' {
                        self.line += 1;
                        self.col = 0; // will be incremented by advance
                    }
                    self.advance();
                }
                if !self.is_at_end() {
                    self.advance(); // consume *
                    self.advance(); // consume /
                }
                continue;
            }

            // Strings
            if c == '"' || c == '\'' {
                tokens.push(self.string_token(c));
                continue;
            }

            if c.is_ascii_digit() {
                tokens.push(self.number_token());
                continue;
            }

            if c.is_alphabetic() || c == '_' {
                tokens.push(self.identifier_token());
                continue;
            }

            let start_col = self.col;
            let start_line = self.line;

            match c {
                '{' => { self.advance(); tokens.push(Token::new(TokenType::LBRACE, None, start_line, start_col)); }
                '}' => { self.advance(); tokens.push(Token::new(TokenType::RBRACE, None, start_line, start_col)); }
                '(' => { self.advance(); tokens.push(Token::new(TokenType::LPAREN, None, start_line, start_col)); }
                ')' => { self.advance(); tokens.push(Token::new(TokenType::RPAREN, None, start_line, start_col)); }
                '+' => { self.advance(); tokens.push(Token::new(TokenType::PLUS, None, start_line, start_col)); }
                '-' => { self.advance(); tokens.push(Token::new(TokenType::MINUS, None, start_line, start_col)); }
                '*' => { self.advance(); tokens.push(Token::new(TokenType::STAR, None, start_line, start_col)); }
                '/' => { self.advance(); tokens.push(Token::new(TokenType::SLASH, None, start_line, start_col)); }
                ';' => { self.advance(); tokens.push(Token::new(TokenType::SEMICOLON, None, start_line, start_col)); }
                ',' => { self.advance(); tokens.push(Token::new(TokenType::COMMA, None, start_line, start_col)); }
                '!' => {
                    self.advance();
                    if self.peek() == '=' {
                        self.advance();
                        tokens.push(Token::new(TokenType::BANG_EQ, None, start_line, start_col));
                    } else {
                        tokens.push(Token::new(TokenType::BANG, None, start_line, start_col));
                    }
                }
                '=' => {
                    self.advance();
                    if self.peek() == '=' {
                        self.advance();
                        tokens.push(Token::new(TokenType::EQ_EQ, None, start_line, start_col));
                    } else if self.peek() == '>' {
                        self.advance();
                        tokens.push(Token::new(TokenType::ARROW, None, start_line, start_col));
                    } else {
                        tokens.push(Token::new(TokenType::EQUALS, None, start_line, start_col));
                    }
                }
                '>' => {
                    self.advance();
                    if self.peek() == '=' {
                        self.advance();
                        tokens.push(Token::new(TokenType::GT_EQ, None, start_line, start_col));
                    } else {
                        tokens.push(Token::new(TokenType::GT, None, start_line, start_col));
                    }
                }
                '<' => {
                    self.advance();
                    if self.peek() == '=' {
                        self.advance();
                        tokens.push(Token::new(TokenType::LT_EQ, None, start_line, start_col));
                    } else {
                        tokens.push(Token::new(TokenType::LT, None, start_line, start_col));
                    }
                }
                '|' => {
                    self.advance();
                    if self.peek() == '|' {
                        self.advance();
                        tokens.push(Token::new(TokenType::OR_OR, None, start_line, start_col));
                    } else if self.peek() == '>' {
                        self.advance();
                        tokens.push(Token::new(TokenType::PIPE, None, start_line, start_col));
                    } else {
                        panic!("Unexpected character: | at line {}, col {}", start_line, start_col);
                    }
                }
                '&' => {
                    self.advance();
                    if self.peek() == '&' {
                        self.advance();
                        tokens.push(Token::new(TokenType::AND_AND, None, start_line, start_col));
                    } else {
                        panic!("Unexpected character: & at line {}, col {}", start_line, start_col);
                    }
                }
                '.' => {
                    self.advance();
                    if self.peek() == '.' {
                        self.advance();
                        tokens.push(Token::new(TokenType::DOT_DOT, None, start_line, start_col));
                    } else {
                        panic!("Unexpected character: . at line {}, col {}", start_line, start_col);
                    }
                }
                '?' => {
                    self.advance();
                    if self.peek() == '.' {
                        self.advance();
                        tokens.push(Token::new(TokenType::QUESTION_DOT, None, start_line, start_col));
                    } else if self.peek() == '?' {
                        self.advance();
                        tokens.push(Token::new(TokenType::NULL_COAL, None, start_line, start_col));
                    } else {
                        panic!("Unexpected character: ? at line {}, col {}", start_line, start_col);
                    }
                }
                _ => panic!("Unexpected character: {} at line {}, col {}", c, start_line, start_col),
            }
        }
        tokens.push(Token::new(TokenType::EOF, None, self.line, self.col));
        tokens
    }
}
