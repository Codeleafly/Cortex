import { TokenType, Token } from '@cortex/shared';

/**
 * Lexer: Breaks source code into tokens.
 * Supports JS-like keywords and structural symbols.
 */
export class Lexer {
    private pos = 0;
    private line = 1;
    private col = 1;

    constructor(private source: string) {}

    private isAlpha(c: string) { return /[a-zA-Z_]/.test(c); }
    private isDigit(c: string) { return /[0-9]/.test(c); }
    private isAlphaNum(c: string) { return this.isAlpha(c) || this.isDigit(c); }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.pos < this.source.length) {
            const char = this.source[this.pos];

            if (/\s/.test(char)) {
                if (char === '\n') { this.line++; this.col = 1; }
                else this.col++;
                this.pos++;
                continue;
            }

            // Comments
            if (char === '/' && this.source[this.pos + 1] === '/') {
                while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
                    this.pos++; this.col++;
                }
                continue;
            }
            if (char === '/' && this.source[this.pos + 1] === '*') {
                this.pos += 2; this.col += 2;
                while (this.pos < this.source.length && !(this.source[this.pos] === '*' && this.source[this.pos + 1] === '/')) {
                    if (this.source[this.pos] === '\n') { this.line++; this.col = 1; }
                    else this.col++;
                    this.pos++;
                }
                this.pos += 2; this.col += 2;
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                const quote = char;
                let val = '';
                const startCol = this.col;
                this.pos++; this.col++;
                while (this.pos < this.source.length && this.source[this.pos] !== quote) {
                    val += this.source[this.pos++];
                    this.col++;
                }
                this.pos++; this.col++; // Closing quote
                tokens.push({ type: TokenType.STRING, value: val, line: this.line, col: startCol });
                continue;
            }

            if (this.isDigit(char)) {
                let val = '';
                const startCol = this.col;
                while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
                    val += this.source[this.pos++];
                    this.col++;
                }
                tokens.push({ type: TokenType.NUMBER, value: val, line: this.line, col: startCol });
                continue;
            }

            if (this.isAlpha(char)) {
                let val = '';
                const startCol = this.col;
                while (this.pos < this.source.length && this.isAlphaNum(this.source[this.pos])) {
                    val += this.source[this.pos++];
                    this.col++;
                }
                const keywords: Record<string, TokenType> = {
                    'let': TokenType.LET,
                    'print': TokenType.PRINT,
                    'if': TokenType.IF,
                    'while': TokenType.WHILE,
                    'fn': TokenType.FN,
                    'return': TokenType.RETURN,
                    'true': TokenType.TRUE,
                    'false': TokenType.FALSE,
                    'null': TokenType.NULL
                };
                tokens.push({ type: keywords[val] ?? TokenType.IDENTIFIER, value: val, line: this.line, col: startCol });
                continue;
            }

            const simple: Record<string, TokenType> = {
                '{': TokenType.LBRACE, '}': TokenType.RBRACE,
                '(': TokenType.LPAREN, ')': TokenType.RPAREN,
                '+': TokenType.PLUS, '-': TokenType.MINUS,
                '*': TokenType.STAR, '/': TokenType.SLASH,
                ';': TokenType.SEMICOLON, '>': TokenType.GT,
                '<': TokenType.LT, ',': TokenType.COMMA,
                '!': TokenType.BANG
            };

            if (char === '=') {
                if (this.source[this.pos + 1] === '=') {
                    tokens.push({ type: TokenType.EQ_EQ, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    tokens.push({ type: TokenType.EQUALS, line: this.line, col: this.col });
                    this.pos++; this.col++;
                }
                continue;
            }

            if (char === '&' && this.source[this.pos + 1] === '&') {
                tokens.push({ type: TokenType.AND_AND, line: this.line, col: this.col });
                this.pos += 2; this.col += 2;
                continue;
            }

            if (char === '|' && this.source[this.pos + 1] === '|') {
                tokens.push({ type: TokenType.OR_OR, line: this.line, col: this.col });
                this.pos += 2; this.col += 2;
                continue;
            }

            if (simple[char] !== undefined) {
                tokens.push({ type: simple[char], line: this.line, col: this.col });
                this.pos++; this.col++;
                continue;
            }

            throw new Error(`Unexpected character: ${char} at line ${this.line}, col ${this.col}`);
        }
        tokens.push({ type: TokenType.EOF, line: this.line, col: this.col });
        return tokens;
    }
}
