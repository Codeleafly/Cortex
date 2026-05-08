use nox_shared::TokenType;
use crate::ast::{Expr, LiteralValue};
use crate::parser_impl::Parser;

impl Parser {
    pub fn expression(&mut self) -> Expr {
        self.pipe()
    }

    pub fn pipe(&mut self) -> Expr {
        let mut expr = self.null_coalesce();
        while self.match_token(TokenType::PIPE) {
            let right = self.null_coalesce();
            expr = Expr::Pipe { left: Box::new(expr), right: Box::new(right) };
        }
        expr
    }

    pub fn null_coalesce(&mut self) -> Expr {
        let mut expr = self.logical_or();
        while self.match_token(TokenType::NULL_COAL) {
            let right = self.logical_or();
            expr = Expr::NullCoalesce { left: Box::new(expr), right: Box::new(right) };
        }
        expr
    }

    pub fn logical_or(&mut self) -> Expr {
        let mut expr = self.logical_and();
        while self.match_token(TokenType::OR_OR) {
            let operator = self.previous().clone();
            let right = self.logical_and();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn logical_and(&mut self) -> Expr {
        let mut expr = self.equality();
        while self.match_token(TokenType::AND_AND) {
            let operator = self.previous().clone();
            let right = self.equality();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn equality(&mut self) -> Expr {
        let mut expr = self.comparison();
        while self.match_tokens(&[TokenType::BANG_EQ, TokenType::EQ_EQ]) {
            let operator = self.previous().clone();
            let right = self.comparison();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn comparison(&mut self) -> Expr {
        let mut expr = self.range();
        while self.match_tokens(&[TokenType::GT, TokenType::GT_EQ, TokenType::LT, TokenType::LT_EQ]) {
            let operator = self.previous().clone();
            let right = self.range();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn range(&mut self) -> Expr {
        let mut expr = self.term();
        if self.match_token(TokenType::DOT_DOT) {
            let end = self.term();
            expr = Expr::Range { start: Box::new(expr), end: Box::new(end) };
        }
        expr
    }

    pub fn term(&mut self) -> Expr {
        let mut expr = self.factor();
        while self.match_tokens(&[TokenType::MINUS, TokenType::PLUS]) {
            let operator = self.previous().clone();
            let right = self.factor();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn factor(&mut self) -> Expr {
        let mut expr = self.unary();
        while self.match_tokens(&[TokenType::SLASH, TokenType::STAR]) {
            let operator = self.previous().clone();
            let right = self.unary();
            expr = Expr::Binary { left: Box::new(expr), operator, right: Box::new(right) };
        }
        expr
    }

    pub fn unary(&mut self) -> Expr {
        if self.match_tokens(&[TokenType::BANG, TokenType::MINUS]) {
            let operator = self.previous().clone();
            let right = self.unary();
            return Expr::Unary { operator, right: Box::new(right), is_prefix: true };
        }
        self.call()
    }

    pub fn call(&mut self) -> Expr {
        let mut expr = self.primary();
        loop {
            if self.match_token(TokenType::LPAREN) {
                expr = self.finish_call(expr);
            } else if self.match_token(TokenType::QUESTION_DOT) {
                let name = self.consume(TokenType::IDENTIFIER, "Expect property name after '?.'").value.clone().unwrap();
                expr = Expr::SafeCall { left: Box::new(expr), right: name };
            } else {
                break;
            }
        }
        expr
    }

    pub fn finish_call(&mut self, callee_expr: Expr) -> Expr {
        let mut args = Vec::new();
        if !self.check(TokenType::RPAREN) {
            loop {
                args.push(self.expression());
                if !self.match_token(TokenType::COMMA) { break; }
            }
        }
        self.consume(TokenType::RPAREN, "Expect ')' after arguments");
        if let Expr::Variable(name) = callee_expr {
            Expr::Call { callee: name, args }
        } else {
            panic!("Only identifiers can be called currently");
        }
    }

    pub fn primary(&mut self) -> Expr {
        if self.match_token(TokenType::FALSE) { return Expr::Literal(LiteralValue::Boolean(false)); }
        if self.match_token(TokenType::TRUE) { return Expr::Literal(LiteralValue::Boolean(true)); }
        if self.match_token(TokenType::NULL) { return Expr::Literal(LiteralValue::Null); }
        if self.match_token(TokenType::ARG_COUNT) { return Expr::ArgCount; }
        
        if self.match_token(TokenType::LBRACE) {
            return self.dict_literal();
        }

        if self.match_token(TokenType::NUMBER) {
            return Expr::Literal(LiteralValue::Number(self.previous().value.as_ref().unwrap().parse().unwrap()));
        }
        if self.match_token(TokenType::STRING) {
            return Expr::Literal(LiteralValue::String(self.previous().value.as_ref().unwrap().clone()));
        }
        if self.match_token(TokenType::IDENTIFIER) {
            let name = self.previous().value.as_ref().unwrap().clone();
            return Expr::Variable(name);
        }
        if self.match_token(TokenType::LPAREN) {
            let expr = self.expression();
            self.consume(TokenType::RPAREN, "Expect ')' after expression");
            return Expr::Grouping(Box::new(expr));
        }
        panic!("Expect expression at {:?}", self.peek());
    }

    pub fn dict_literal(&mut self) -> Expr {
        let mut entries = Vec::new();
        if !self.check(TokenType::RBRACE) {
            loop {
                let key = self.consume(TokenType::IDENTIFIER, "Expect dictionary key (identifier)").value.clone().unwrap();
                self.consume(TokenType::EQUALS, "Expect '=' after dictionary key");
                let value = self.expression();
                entries.push((key, value));
                if !self.match_token(TokenType::COMMA) { break; }
            }
        }
        self.consume(TokenType::RBRACE, "Expect '}' after dictionary entries");
        Expr::Dict(entries)
    }
}
