import { TokenType } from '@nox/shared';
import { PrimaryParser } from './PrimaryParser.js';
import { Expr, LiteralExpr } from './AST.js';

export abstract class BinaryParser extends PrimaryParser {
    public expression(): Expr {
        return this.pipe();
    }

    private pipe(): Expr {
        let expr = this.nullCoalescing();
        while (this.match(TokenType.PIPE)) {
            const operator = this.previous();
            const right = this.nullCoalescing();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private nullCoalescing(): Expr {
        let expr = this.logicalOr();
        while (this.match(TokenType.NULL_COAL)) {
            const operator = this.previous();
            const right = this.logicalOr();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
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
        let expr = this.range();
        while (this.match(TokenType.GT, TokenType.LT, TokenType.GT_EQ, TokenType.LT_EQ)) {
            const operator = this.previous();
            const right = this.range();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    private range(): Expr {
        let expr = this.term();
        if (this.match(TokenType.DOT_DOT)) {
            const right = this.term();
            return { type: 'RangeExpr', start: expr, end: right };
        }
        return expr;
    }

    protected term(): Expr {
        let expr = this.factor();
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    protected factor(): Expr {
        let expr = this.unary();
        while (this.match(TokenType.STAR, TokenType.SLASH)) {
            const operator = this.previous();
            const right = this.unary();
            expr = { type: 'BinaryExpr', left: expr, operator, right };
        }
        return expr;
    }

    protected unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return { type: 'UnaryExpr', operator, right, kind: 'prefix' };
        }
        return this.postfix();
    }

    protected postfix(): Expr {
        let expr = this.primary();
        while (true) {
            if (this.match(TokenType.QUESTION_DOT)) {
                const operator = this.previous();
                const property = this.consume(TokenType.IDENTIFIER, "Expect property name after '?.'.").value!;
                const propertyExpr: LiteralExpr = { type: 'LiteralExpr', value: property };
                expr = { type: 'BinaryExpr', left: expr, operator, right: propertyExpr };
            } else if (this.match(TokenType.BANG)) {
                const operator = this.previous();
                expr = { type: 'UnaryExpr', operator, right: expr, kind: 'postfix' };
            } else {
                break;
            }
        }
        return expr;
    }
}
