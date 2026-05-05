import { TokenType, Token } from '@nox/shared';
import { BaseParser } from './BaseParser.js';
import { Expr, LiteralExpr } from './AST.js';

export abstract class PrimaryParser extends BaseParser {
    protected abstract expression(): Expr;
    protected abstract statement(): any;
    protected abstract block(): any[];

    protected primary(): Expr {
        if (this.match(TokenType.FALSE)) return { type: 'LiteralExpr', value: false };
        if (this.match(TokenType.TRUE)) return { type: 'LiteralExpr', value: true };
        if (this.match(TokenType.NULL)) return { type: 'LiteralExpr', value: null };

        if (this.match(TokenType.LBRACE)) {
            const entries: { key: string, value: Expr }[] = [];
            if (!this.check(TokenType.RBRACE)) {
                do {
                    const key = this.consume(TokenType.IDENTIFIER, "Expect dictionary key.").value!;
                    this.consume(TokenType.EQUALS, "Expect '=' after dictionary key.");
                    const value = this.expression();
                    entries.push({ key, value });
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RBRACE, "Expect '}' after dictionary entries.");
            return { type: 'DictExpr', entries };
        }

        if (this.match(TokenType.ARG_COUNT)) {
            if (this.match(TokenType.LPAREN)) this.consume(TokenType.RPAREN, "Expect ')' after 'arg_count'.");
            return { type: 'ArgCountExpr' };
        }

        if (this.match(TokenType.NUMBER)) return { type: 'LiteralExpr', value: parseInt(this.previous().value!) };
        if (this.match(TokenType.STRING)) return { type: 'LiteralExpr', value: this.previous().value! };

        if (this.match(TokenType.IDENTIFIER)) {
            const name = this.previous().value!;
            if (this.match(TokenType.LPAREN)) {
                const args: Expr[] = [];
                if (!this.check(TokenType.RPAREN)) {
                    do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, "Expect ')' after arguments.");
                return { type: 'CallExpr', callee: name, args };
            }
            return { type: 'VariableExpr', name };
        }
        
        if (this.match(TokenType.GET_ARG)) return this.builtinCall('get_arg');
        if (this.match(TokenType.TO_NUMBER)) return this.builtinCall('to_number');
        if (this.match(TokenType.READ_FILE)) return this.builtinCall('read_file');
        if (this.match(TokenType.WRITE_FILE)) {
            this.consume(TokenType.LPAREN, "Expect '(' after 'write_file'.");
            const arg1 = this.expression();
            this.consume(TokenType.COMMA, "Expect ',' after first argument.");
            const arg2 = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after arguments.");
            return { type: 'CallExpr', callee: 'write_file', args: [arg1, arg2] };
        }
        if (this.match(TokenType.FILE_EXISTS)) return this.builtinCall('file_exists');
        if (this.match(TokenType.STR_UPPER)) return this.builtinCall('str_upper');
        if (this.match(TokenType.STR_WORDS)) return this.builtinCall('str_words');
        if (this.match(TokenType.READ_LINE)) {
            if (this.match(TokenType.LPAREN)) this.consume(TokenType.RPAREN, "Expect ')' after 'read_line'.");
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
        if (this.match(TokenType.STR_LEN)) return this.builtinCall('str_len');
        if (this.match(TokenType.RUN_CMD)) return this.builtinCall('run_command');

        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, "Expect ')' after expression.");
            return { type: 'GroupingExpr', expression: expr };
        }

        throw new Error(`Expect expression at line ${this.peek().line}, col ${this.peek().col}. Found ${TokenType[this.peek().type]}`);
    }

    private builtinCall(name: string): Expr {
        this.consume(TokenType.LPAREN, `Expect '(' after '${name}'.`);
        const arg = this.expression();
        this.consume(TokenType.RPAREN, "Expect ')' after argument.");
        return { type: 'CallExpr', callee: name, args: [arg] };
    }
}
