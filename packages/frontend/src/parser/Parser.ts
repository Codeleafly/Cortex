import { TokenType, Token } from '@cortex/shared';
import { Stmt, Expr } from './AST.js';

export class Parser {
    private tokens: Token[] = [];
    private pos = 0;

    constructor() {}

    public parse(tokens: Token[]): Stmt[] {
        this.tokens = tokens;
        this.pos = 0;
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    private statement(): Stmt {
        if (this.match(TokenType.LET)) return this.letStatement();
        if (this.match(TokenType.FN)) return this.fnStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();
        
        // Check for assignment: identifier = ...
        if (this.peek().type === TokenType.IDENTIFIER && this.peekNext().type === TokenType.EQUALS) {
            return this.assignment();
        }

        return this.expressionStatement();
    }

    private letStatement(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.").value!;
        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");
        const initializer = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'LetStmt', name, initializer };
    }

    private assignment(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.").value!;
        this.consume(TokenType.EQUALS, "Expect '='.");
        const value = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'AssignStmt', name, value };
    }

    private fnStatement(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expect function name.").value!;
        this.consume(TokenType.LPAREN, "Expect '(' after function name.");
        const params: string[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name.").value!);
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expect ')' after parameters.");
        const body = this.block();
        return { type: 'FnStmt', name, params, body };
    }

    private ifStatement(): Stmt {
        this.consume(TokenType.LPAREN, "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume(TokenType.RPAREN, "Expect ')' after if condition.");
        const thenBranch = this.block();

        let elseBranch: Stmt[] | undefined = undefined;
        if (this.match(TokenType.ELSE)) {
            if (this.check(TokenType.IF)) {
                this.advance(); // consume 'if'
                elseBranch = [this.ifStatement()];
            } else {
                elseBranch = this.block();
            }
        }

        return { type: 'IfStmt', condition, thenBranch, elseBranch };
    }

    private whileStatement(): Stmt {
        this.consume(TokenType.LPAREN, "Expect '(' after 'while'.");
        const condition = this.expression();
        this.consume(TokenType.RPAREN, "Expect ')' after while condition.");
        const body = this.block();
        return { type: 'WhileStmt', condition, body };
    }

    private printStatement(): Stmt {
        const expression = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'PrintStmt', expression };
    }

    private returnStatement(): Stmt {
        const value = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'ReturnStmt', value };
    }

    private expressionStatement(): Stmt {
        const expression = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'ExprStmt', expression };
    }

    private block(): Stmt[] {
        this.consume(TokenType.LBRACE, "Expect '{' before block.");
        const statements: Stmt[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        this.consume(TokenType.RBRACE, "Expect '}' after block.");
        return statements;
    }

    private expression(): Expr {
        return this.logicalOr();
    }

    private logicalOr(): Expr {
        let expr = this.logicalAnd();
        while (this.match(TokenType.OR_OR)) {
            const operator = this.previous();
            const right = this.logicalAnd();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private logicalAnd(): Expr {
        let expr = this.equality();
        while (this.match(TokenType.AND_AND)) {
            const operator = this.previous();
            const right = this.equality();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private equality(): Expr {
        let expr = this.comparison();
        while (this.match(TokenType.EQ_EQ, TokenType.BANG_EQ)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private comparison(): Expr {
        let expr = this.term();
        while (this.match(TokenType.GT, TokenType.LT)) {
            const operator = this.previous();
            const right = this.term();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private term(): Expr {
        let expr = this.factor();
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private factor(): Expr {
        let expr = this.unary();
        while (this.match(TokenType.STAR, TokenType.SLASH)) {
            const operator = this.previous();
            const right = this.unary();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return { type: 'UnaryExpr', operator, right };
        }
        return this.primary();
    }

    private primary(): Expr {
        if (this.match(TokenType.FALSE)) return { type: 'LiteralExpr', value: false };
        if (this.match(TokenType.TRUE)) return { type: 'LiteralExpr', value: true };
        if (this.match(TokenType.NULL)) return { type: 'LiteralExpr', value: null };
        if (this.match(TokenType.ARG_COUNT)) {
            if (this.match(TokenType.LPAREN)) {
                this.consume(TokenType.RPAREN, "Expect ')' after 'arg_count'.");
            }
            return { type: 'ArgCountExpr' };
        }

        if (this.match(TokenType.NUMBER)) {
            return { type: 'LiteralExpr', value: parseInt(this.previous().value!) };
        }

        if (this.match(TokenType.STRING)) {
            return { type: 'LiteralExpr', value: this.previous().value! };
        }

        if (this.match(TokenType.IDENTIFIER)) {
            const name = this.previous().value!;
            if (this.match(TokenType.LPAREN)) {
                const args: Expr[] = [];
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, "Expect ')' after arguments.");
                return { type: 'CallExpr', callee: name, args };
            }
            // Support built-ins like get_arg and to_number as expressions
            return { type: 'VariableExpr', name };
        }
        
        if (this.match(TokenType.GET_ARG)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'get_arg'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'get_arg', args: [arg] };
        }

        if (this.match(TokenType.TO_NUMBER)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'to_number'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'to_number', args: [arg] };
        }

        if (this.match(TokenType.READ_FILE)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'read_file'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'read_file', args: [arg] };
        }

        if (this.match(TokenType.WRITE_FILE)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'write_file'.");
            const arg1 = this.expression();
            this.consume(TokenType.COMMA, "Expect ',' after first argument.");
            const arg2 = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after arguments.");
            return { type: 'CallExpr', callee: 'write_file', args: [arg1, arg2] };
        }

        if (this.match(TokenType.FILE_EXISTS)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'file_exists'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'file_exists', args: [arg] };
        }

        if (this.match(TokenType.STR_UPPER)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'str_upper'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'str_upper', args: [arg] };
        }

        if (this.match(TokenType.STR_WORDS)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'str_words'.");
            const arg = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'str_words', args: [arg] };
        }

        if (this.match(TokenType.READ_LINE)) {
            if (this.match(TokenType.LPAREN)) {
                this.consume(TokenType.RPAREN, "Expect ')' after 'read_line'.");
            }
            return { type: 'CallExpr', callee: 'read_line', args: [] };
        }

        if (this.match(TokenType.STR_AT)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'str_at'.");
            const str = this.expression();
            this.consume(TokenType.COMMA, "Expect ',' after string.");
            const idx = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after arguments.");
            return { type: 'CallExpr', callee: 'str_at', args: [str, idx] };
        }

        if (this.match(TokenType.STR_LEN)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'str_len'.");
            const str = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'str_len', args: [str] };
        }

        if (this.match(TokenType.RUN_CMD)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'run_command'.");
            const cmd = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after argument.");
            return { type: 'CallExpr', callee: 'run_command', args: [cmd] };
        }

        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after expression.");
            return { type: 'GroupingExpr', expression: expr };
        }

        throw new Error(`Expect expression at line ${this.peek().line}, col ${this.peek().col}. Found ${TokenType[this.peek().type]}`);
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at line ${this.peek().line}, col ${this.peek().col}`);
    }

    private consumeOptional(type: TokenType) {
        if (this.check(type)) this.advance();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.pos];
    }

    private peekNext(): Token {
        if (this.isAtEnd()) return this.tokens[this.pos];
        return this.tokens[this.pos + 1];
    }

    private previous(): Token {
        return this.tokens[this.pos - 1];
    }
}
