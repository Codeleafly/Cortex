import { TokenType, Token } from '@nox/shared';

export abstract class BaseParser {
    protected tokens: Token[] = [];
    protected pos = 0;

    protected match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    protected consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at line ${this.peek().line}, col ${this.peek().col}`);
    }

    protected consumeOptional(type: TokenType) {
        if (this.check(type)) this.advance();
    }

    protected check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    protected advance(): Token {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    protected isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    protected peek(): Token {
        return this.tokens[this.pos];
    }

    protected peekNext(): Token {
        if (this.isAtEnd()) return this.tokens[this.pos];
        return this.tokens[this.pos + 1];
    }

    protected previous(): Token {
        return this.tokens[this.pos - 1];
    }
}
