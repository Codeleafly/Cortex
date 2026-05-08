use nox_shared::TokenType;
use crate::ast::Stmt;
use crate::parser_impl::Parser;

impl Parser {
    pub fn statement(&mut self) -> Stmt {
        if self.match_token(TokenType::IS) { self.let_statement() }
        else if self.match_token(TokenType::MUT) { self.let_statement_mut() }
        else if self.peek().token_type == TokenType::IDENTIFIER && self.peek_next().token_type == TokenType::EQUALS { self.assign_statement() }
        else if self.match_token(TokenType::PRINT) || self.match_token(TokenType::SAY) { self.print_statement() }
        else if self.match_token(TokenType::IF) { self.if_statement() }
        else if self.match_token(TokenType::WHILE) { self.while_statement() }
        else if self.match_token(TokenType::FOR) { self.for_statement() }
        else if self.match_token(TokenType::FN) { self.fn_statement() }
        else if self.match_token(TokenType::RETURN) { self.return_statement() }
        else if self.match_token(TokenType::MATCH) { self.match_statement() }
        else if self.match_token(TokenType::IMPORT) { self.import_statement() }
        else if !self.is_strict && self.peek().token_type == TokenType::IDENTIFIER && self.peek_next().token_type == TokenType::EQUALS { self.let_statement_implicit() }
        else { self.expression_statement() }
    }

    pub fn assign_statement(&mut self) -> Stmt {
        let name = self.consume(TokenType::IDENTIFIER, "Expect variable name").value.clone().unwrap();
        self.consume(TokenType::EQUALS, "Expect '=' after variable name");
        let value = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }

        if !self.is_strict {
             // In non-strict mode, assignment to unknown can be declaration.
             // For now, let's keep it as Assign and handle in Compiler or treat as implicit declaration if not found.
        }
        Stmt::Assign { name, value }
    }

    pub fn let_statement_implicit(&mut self) -> Stmt {
        let name = self.consume(TokenType::IDENTIFIER, "Expect variable name").value.clone().unwrap();
        self.consume(TokenType::EQUALS, "Expect '=' after variable name");
        let initializer = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Let { name, initializer, is_mutable: true }
    }

    pub fn let_statement(&mut self) -> Stmt {
        let name = self.consume(TokenType::IDENTIFIER, "Expect variable name").value.clone().unwrap();
        if self.match_token(TokenType::COLON) {
            self.consume(TokenType::IDENTIFIER, "Expect type name after ':'");
        }
        self.consume(TokenType::EQUALS, "Expect '=' after variable name");
        let initializer = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Let { name, initializer, is_mutable: false }
    }

    pub fn let_statement_mut(&mut self) -> Stmt {
        let name = self.consume(TokenType::IDENTIFIER, "Expect variable name").value.clone().unwrap();
        if self.match_token(TokenType::COLON) {
            self.consume(TokenType::IDENTIFIER, "Expect type name after ':'");
        }
        self.consume(TokenType::EQUALS, "Expect '=' after variable name");
        let initializer = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Let { name, initializer, is_mutable: true }
    }

    pub fn print_statement(&mut self) -> Stmt {
        let expression = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Print { expression }
    }

    pub fn if_statement(&mut self) -> Stmt {
        let condition = self.expression();
        let then_branch = self.block();
        let mut else_branch = None;
        if self.match_token(TokenType::ELSE) {
            if self.peek().token_type == TokenType::IF {
                self.advance();
                else_branch = Some(vec![self.if_statement()]);
            } else {
                else_branch = Some(self.block());
            }
        }
        Stmt::If { condition, then_branch, else_branch }
    }

    pub fn while_statement(&mut self) -> Stmt {
        let condition = self.expression();
        let body = self.block();
        Stmt::While { condition, body }
    }

    pub fn for_statement(&mut self) -> Stmt {
        let item = self.consume(TokenType::IDENTIFIER, "Expect loop variable name").value.clone().unwrap();
        self.consume(TokenType::IN, "Expect 'in' after for variable");
        let iterable = self.expression();
        let body = self.block();
        Stmt::For { item, iterable, body }
    }

    pub fn fn_statement(&mut self) -> Stmt {
        let name = self.consume(TokenType::IDENTIFIER, "Expect function name").value.clone().unwrap();
        self.consume(TokenType::LPAREN, "Expect '(' after function name");
        let mut params = Vec::new();
        if !self.check(TokenType::RPAREN) {
            loop {
                // Support optional type annotations: name: type
                let param_name = self.consume(TokenType::IDENTIFIER, "Expect parameter name").value.clone().unwrap();
                if self.match_token(TokenType::COLON) {
                    self.consume(TokenType::IDENTIFIER, "Expect type name after ':'");
                }
                params.push(param_name);
                if !self.match_token(TokenType::COMMA) { break; }
            }
        }
        self.consume(TokenType::RPAREN, "Expect ')' after parameters");
        
        // Check for return type
        if self.match_token(TokenType::THIN_ARROW) {
            self.consume(TokenType::IDENTIFIER, "Expect return type after '->'");
        }

        let body = if self.match_token(TokenType::ARROW) {
            vec![Stmt::Return { value: self.expression() }]
        } else {
            self.block()
        };
        
        Stmt::Fn { name, params, body }
    }

    pub fn return_statement(&mut self) -> Stmt {
        let value = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Return { value }
    }

    pub fn match_statement(&mut self) -> Stmt {
        let expression = self.expression();
        self.consume(TokenType::LBRACE, "Expect '{' after match expression");
        let mut cases = Vec::new();
        while !self.check(TokenType::RBRACE) && !self.is_at_end() {
            let condition = if self.match_token(TokenType::UNDERSCORE) || self.match_token(TokenType::ELSE) {
                None
            } else {
                Some(self.expression())
            };
            self.consume(TokenType::ARROW, "Expect '=>' after case condition");

            let body = if self.check(TokenType::LBRACE) {
                self.block()
            } else {
                vec![self.statement()]
            };

            cases.push((condition, body));
        }
        self.consume(TokenType::RBRACE, "Expect '}' after match cases");
        Stmt::Match { expression, cases }
    }

    pub fn block(&mut self) -> Vec<Stmt> {
        self.consume(TokenType::LBRACE, "Expect '{' before block");
        let mut statements = Vec::new();
        while !self.check(TokenType::RBRACE) && !self.is_at_end() {
            statements.push(self.statement());
        }
        self.consume(TokenType::RBRACE, "Expect '}' after block");
        statements
    }

    pub fn import_statement(&mut self) -> Stmt {
        let mut names = Vec::new();
        if self.match_token(TokenType::LBRACE) {
            loop {
                names.push(self.consume(TokenType::IDENTIFIER, "Expect imported name").value.clone().unwrap());
                if !self.match_token(TokenType::COMMA) { break; }
            }
            self.consume(TokenType::RBRACE, "Expect '}' after names");
            self.consume(TokenType::FROM, "Expect 'from' after names");
        } else {
            names.push(self.consume(TokenType::IDENTIFIER, "Expect name").value.clone().unwrap());
            if self.match_token(TokenType::FROM) {
                // as above
            }
        }
        let source = self.consume(TokenType::STRING, "Expect source URL/path").value.clone().unwrap();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Import { names, source }
    }

    pub fn expression_statement(&mut self) -> Stmt {
        let expr = self.expression();
        if self.peek().token_type == TokenType::SEMICOLON { self.advance(); }
        Stmt::Expr(expr)
    }
}
