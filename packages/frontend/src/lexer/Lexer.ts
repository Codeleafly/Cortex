import { TokenType, Token } from '@nox/shared';

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
                    let current = this.source[this.pos];
                    if (current === '\\') {
                        this.pos++; this.col++;
                        const next = this.source[this.pos];
                        switch (next) {
                            case 'n': val += '\n'; break;
                            case 'r': val += '\r'; break;
                            case 't': val += '\t'; break;
                            case '\\': val += '\\'; break;
                            case 'e': val += '\x1b'; break; // ANSI Escape
                            case '"': val += '"'; break;
                            case "'": val += "'"; break;
                            default: val += '\\' + next; break;
                        }
                    } else {
                        val += current;
                    }
                    this.pos++; this.col++;
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
                    'is': TokenType.IS,
                    'mut': TokenType.MUT,
                    'print': TokenType.PRINT,
                    'if': TokenType.IF,
                    'else': TokenType.ELSE,
                    'while': TokenType.WHILE,
                    'for': TokenType.FOR,
                    'in': TokenType.IN,
                    'fn': TokenType.FN,
                    'return': TokenType.RETURN,
                    'match': TokenType.MATCH,
                    'true': TokenType.TRUE,
                    'false': TokenType.FALSE,
                    'null': TokenType.NULL,
                    'arg_count': TokenType.ARG_COUNT,
                    'get_arg': TokenType.GET_ARG,
                    'to_number': TokenType.TO_NUMBER,
                    'read_file': TokenType.READ_FILE,
                    'write_file': TokenType.WRITE_FILE,
                    'file_exists': TokenType.FILE_EXISTS,
                    'str_upper': TokenType.STR_UPPER,
                    'str_words': TokenType.STR_WORDS,
                    'read_line': TokenType.READ_LINE,
                    'str_at': TokenType.STR_AT,
                    'str_len': TokenType.STR_LEN,
                    'run_command': TokenType.RUN_CMD
                };
                tokens.push({ type: keywords[val] ?? TokenType.IDENTIFIER, value: val, line: this.line, col: startCol });
                continue;
            }

            const simple: Record<string, TokenType> = {
                '{': TokenType.LBRACE, '}': TokenType.RBRACE,
                '(': TokenType.LPAREN, ')': TokenType.RPAREN,
                '+': TokenType.PLUS, '-': TokenType.MINUS,
                '*': TokenType.STAR, '/': TokenType.SLASH,
                ';': TokenType.SEMICOLON, ',': TokenType.COMMA,
                '!': TokenType.BANG
            };

            if (char === '=') {
                if (this.source[this.pos + 1] === '=') {
                    tokens.push({ type: TokenType.EQ_EQ, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else if (this.source[this.pos + 1] === '>') {
                    tokens.push({ type: TokenType.ARROW, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    tokens.push({ type: TokenType.EQUALS, line: this.line, col: this.col });
                    this.pos++; this.col++;
                }
                continue;
            }

            if (char === '>') {
                if (this.source[this.pos + 1] === '=') {
                    tokens.push({ type: TokenType.GT_EQ, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    tokens.push({ type: TokenType.GT, line: this.line, col: this.col });
                    this.pos++; this.col++;
                }
                continue;
            }

            if (char === '<') {
                if (this.source[this.pos + 1] === '=') {
                    tokens.push({ type: TokenType.LT_EQ, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    tokens.push({ type: TokenType.LT, line: this.line, col: this.col });
                    this.pos++; this.col++;
                }
                continue;
            }

            if (char === '|') {
                if (this.source[this.pos + 1] === '|') {
                    tokens.push({ type: TokenType.OR_OR, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else if (this.source[this.pos + 1] === '>') {
                    tokens.push({ type: TokenType.PIPE, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    // Current Nox doesn't have single |, but we should handle it or error
                    tokens.push({ type: TokenType.SLASH, line: this.line, col: this.col }); // Wait, single | is not SLASH
                    throw new Error(`Unexpected character: | at line ${this.line}, col ${this.col}`);
                }
                continue;
            }

            if (char === '?') {
                if (this.source[this.pos + 1] === '.') {
                    tokens.push({ type: TokenType.QUESTION_DOT, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else if (this.source[this.pos + 1] === '?') {
                    tokens.push({ type: TokenType.NULL_COAL, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    throw new Error(`Unexpected character: ? at line ${this.line}, col ${this.col}`);
                }
                continue;
            }

            if (char === '.' && this.source[this.pos + 1] === '.') {
                tokens.push({ type: TokenType.DOT_DOT, line: this.line, col: this.col });
                this.pos += 2; this.col += 2;
                continue;
            }

            if (char === '&' && this.source[this.pos + 1] === '&') {
                tokens.push({ type: TokenType.AND_AND, line: this.line, col: this.col });
                this.pos += 2; this.col += 2;
                continue;
            }

            if (char === '!') {
                if (this.source[this.pos + 1] === '=') {
                    tokens.push({ type: TokenType.BANG_EQ, line: this.line, col: this.col });
                    this.pos += 2; this.col += 2;
                } else {
                    tokens.push({ type: TokenType.BANG, line: this.line, col: this.col });
                    this.pos++; this.col++;
                }
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
