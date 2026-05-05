import { TokenType, Token } from '@nox/shared';
import { Stmt, Expr } from './AST.js';
import { BinaryParser } from './BinaryParser.js';

export class StatementParser extends BinaryParser {

    protected statement(): Stmt {
        if (this.match(TokenType.LET)) return this.letStatement();
        if (this.match(TokenType.IS)) return this.varStatement(false);
        if (this.match(TokenType.MUT)) return this.varStatement(true);
        if (this.match(TokenType.FN)) return this.fnStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.MATCH)) return this.matchStatement();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();
        
        if (this.peek().type === TokenType.IDENTIFIER && this.peekNext().type === TokenType.EQUALS) {
            return this.assignment();
        }

        return this.expressionStatement();
    }

    private letStatement(): Stmt {
        return this.varStatement(true); 
    }

    private varStatement(isMutable: boolean): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.").value!;
        this.consume(TokenType.EQUALS, "Expect '=' after variable name.");
        const initializer = this.expression();
        this.consumeOptional(TokenType.SEMICOLON);
        return { type: 'LetStmt', name, initializer, isMutable };
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
        
        if (this.match(TokenType.ARROW)) {
            const bodyExpr = this.expression();
            this.consumeOptional(TokenType.SEMICOLON);
            return { type: 'FnStmt', name, params, body: [{ type: 'ReturnStmt', value: bodyExpr }] };
        }

        const body = this.block();
        return { type: 'FnStmt', name, params, body };
    }

    private ifStatement(): Stmt {
        const hasParens = this.match(TokenType.LPAREN);
        const condition = this.expression();
        if (hasParens) this.consume(TokenType.RPAREN, "Expect ')' after if condition.");
        const thenBranch = this.block();
        
        let elseBranch: Stmt[] | undefined = undefined;
        if (this.match(TokenType.ELSE)) {
            if (this.check(TokenType.IF)) {
                this.advance(); 
                elseBranch = [this.ifStatement()];
            } else {
                elseBranch = this.block();
            }
        }
        
        return { type: 'IfStmt', condition, thenBranch, elseBranch };
    }

    private whileStatement(): Stmt {
        const hasParens = this.match(TokenType.LPAREN);
        const condition = this.expression();
        if (hasParens) this.consume(TokenType.RPAREN, "Expect ')' after while condition.");
        const body = this.block();
        return { type: 'WhileStmt', condition, body };
    }

    private forStatement(): Stmt {
        const item = this.consume(TokenType.IDENTIFIER, "Expect item name after 'for'.").value!;
        this.consume(TokenType.IN, "Expect 'in' after for item.");
        const iterable = this.expression();
        const body = this.block();
        return { type: 'ForStmt', item, iterable, body };
    }

    private matchStatement(): Stmt {
        const expression = this.expression();
        this.consume(TokenType.LBRACE, "Expect '{' after match expression.");
        const cases: { condition: Expr | null, body: Stmt[] }[] = [];
        
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            let condition: Expr | null = null;
            if (this.match(TokenType.IDENTIFIER) && this.previous().value === '_') {
                condition = null; 
            } else {
                condition = this.expression();
            }
            
            this.consume(TokenType.ARROW, "Expect '=>' after case condition.");
            
            let body: Stmt[];
            if (this.check(TokenType.LBRACE)) {
                body = this.block();
            } else {
                body = [this.statement()];
            }
            cases.push({ condition, body });
            this.consumeOptional(TokenType.SEMICOLON);
        }
        
        this.consume(TokenType.RBRACE, "Expect '}' after match cases.");
        return { type: 'MatchStmt', expression, cases };
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

    protected block(): Stmt[] {
        this.consume(TokenType.LBRACE, "Expect '{' before block.");
        const statements: Stmt[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        this.consume(TokenType.RBRACE, "Expect '}' after block.");
        return statements;
    }
}