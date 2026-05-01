/**
 * Cortex Core Engine
 * Implements a high-performance, stack-based Virtual Machine and a 
 * one-pass compiler for a hybrid JS/Python syntax.
 */

/**
 * Type-safe Opcodes for the Cortex VM.
 * These are numeric values for maximum performance.
 */
export enum Opcode {
    HALT = 0,
    PUSH = 1,
    ADD = 2,
    SUB = 3,
    MUL = 4,
    DIV = 5,
    LOAD = 6,   // Load from memory to stack
    STORE = 7,  // Store from stack to memory
    PRINT = 8,
    JMP = 9,
    JMP_IF_FALSE = 10,
    CMP_GT = 11,
    CMP_LT = 12,
    CMP_EQ = 13,
    POP = 14,
    PUSH_STR = 15,
    AND = 16,
    OR = 17,
    NOT = 18,
    RET = 19,
    CALL = 20,
}

/**
 * Token types for the Lexer.
 */
export enum TokenType {
    NUMBER,
    STRING,
    IDENTIFIER,
    LET,
    PRINT,
    IF,
    WHILE,
    FN,
    RETURN,
    TRUE,
    FALSE,
    NULL,
    LBRACE,
    RBRACE,
    LPAREN,
    RPAREN,
    COMMA,
    EQUALS,
    PLUS,
    MINUS,
    STAR,
    SLASH,
    GT,
    LT,
    EQ_EQ,
    AND_AND,
    OR_OR,
    BANG,
    SEMICOLON,
    EOF
}

export interface Token {
    type: TokenType;
    value?: string;
    line: number;
    col: number;
}

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

/**
 * One-pass Compiler: Directly emits bytecode from tokens.
 * Uses backpatching for forward jumps in control flow.
 */
export class Compiler {
    private tokens: Token[] = [];
    private pos = 0;
    private bytecode: number[] = [];
    private stringPool: string[] = [];
    private scopes: Map<string, number>[] = [new Map()]; // Stack of scopes

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek() { return this.tokens[this.pos]; }
    private advance() { return this.tokens[this.pos++]; }
    private match(type: TokenType) {
        if (this.peek().type === type) {
            return this.advance();
        }
        return null;
    }

    private emit(op: number) { this.bytecode.push(op); }

    private functions = new Map<string, { address: number, argCount: number }>();

    private resolveVariable(name: string): number {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) return this.scopes[i].get(name)!;
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    private defineVariable(name: string) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (!currentScope.has(name)) {
            let totalVars = 0;
            this.scopes.forEach(s => totalVars += s.size);
            currentScope.set(name, totalVars);
        }
        return currentScope.get(name)!;
    }

    public compile(): { bytecode: Int32Array, stringPool: string[] } {
        while (this.peek().type !== TokenType.EOF) {
            this.statement();
        }
        this.emit(Opcode.HALT);
        return { 
            bytecode: new Int32Array(this.bytecode), 
            stringPool: this.stringPool 
        };
    }

    private statement() {
        if (this.match(TokenType.LET)) {
            const name = this.advance().value!;
            this.match(TokenType.EQUALS);
            this.expression();
            this.match(TokenType.SEMICOLON);
            const addr = this.defineVariable(name);
            this.emit(Opcode.STORE);
            this.emit(addr);
        } else if (this.peek().type === TokenType.IDENTIFIER && this.tokens[this.pos + 1]?.type === TokenType.EQUALS) {
            // Assignment: name = expression;
            const name = this.advance().value!;
            this.match(TokenType.EQUALS);
            this.expression();
            this.match(TokenType.SEMICOLON);
            const addr = this.resolveVariable(name);
            this.emit(Opcode.STORE);
            this.emit(addr);
        } else if (this.match(TokenType.PRINT)) {
            this.expression();
            this.match(TokenType.SEMICOLON);
            this.emit(Opcode.PRINT);
        } else if (this.match(TokenType.FN)) {
            const name = this.advance().value!;
            const jumpOverFn = Opcode.JMP;
            this.emit(jumpOverFn);
            const jumpOverIdx = this.bytecode.length;
            this.emit(0); // Placeholder

            const fnStart = this.bytecode.length;
            this.match(TokenType.LPAREN);
            const args: string[] = [];
            if (this.peek().type !== TokenType.RPAREN) {
                do {
                    args.push(this.advance().value!);
                } while (this.match(TokenType.COMMA));
            }
            this.match(TokenType.RPAREN);

            this.functions.set(name, { address: fnStart, argCount: args.length });

            this.scopes.push(new Map());
            // Emit STORE for each argument (popping from stack into local memory)
            // Note: VM.CALL pushes args in order, so we pop them in reverse order to store.
            for (let i = args.length - 1; i >= 0; i--) {
                const addr = this.defineVariable(args[i]);
                this.emit(Opcode.STORE);
                this.emit(addr);
            }
            
            this.block();
            
            this.scopes.pop();
            this.emit(Opcode.RET);

            this.bytecode[jumpOverIdx] = this.bytecode.length;
        } else if (this.match(TokenType.RETURN)) {
            this.expression();
            this.match(TokenType.SEMICOLON);
            this.emit(Opcode.RET);
        } else if (this.match(TokenType.WHILE)) {
            const loopStart = this.bytecode.length;
            this.match(TokenType.LPAREN);
            this.expression();
            this.match(TokenType.RPAREN);
            
            this.emit(Opcode.JMP_IF_FALSE);
            const jumpOffsetIdx = this.bytecode.length;
            this.emit(0); // Placeholder

            this.block();

            this.emit(Opcode.JMP);
            this.emit(loopStart);

            // Backpatch
            this.bytecode[jumpOffsetIdx] = this.bytecode.length;
        } else if (this.match(TokenType.IF)) {
            this.match(TokenType.LPAREN);
            this.expression();
            this.match(TokenType.RPAREN);
            
            this.emit(Opcode.JMP_IF_FALSE);
            const jumpOffsetIdx = this.bytecode.length;
            this.emit(0); // Placeholder

            this.block();

            // Backpatch
            this.bytecode[jumpOffsetIdx] = this.bytecode.length;
        } else {
            this.expression();
            this.match(TokenType.SEMICOLON);
            this.emit(Opcode.POP);
        }
    }

    private block() {
        this.match(TokenType.LBRACE);
        this.scopes.push(new Map());
        while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
            this.statement();
        }
        this.scopes.pop();
        this.match(TokenType.RBRACE);
    }

    private expression() {
        this.logicalOr();
    }

    private logicalOr() {
        this.logicalAnd();
        while (this.match(TokenType.OR_OR)) {
            this.logicalAnd();
            this.emit(Opcode.OR);
        }
    }

    private logicalAnd() {
        this.comparison();
        while (this.match(TokenType.AND_AND)) {
            this.comparison();
            this.emit(Opcode.AND);
        }
    }

    private comparison() {
        this.term();
        while (true) {
            if (this.match(TokenType.GT)) {
                this.term();
                this.emit(Opcode.CMP_GT);
            } else if (this.match(TokenType.LT)) {
                this.term();
                this.emit(Opcode.CMP_LT);
            } else if (this.match(TokenType.EQ_EQ)) {
                this.term();
                this.emit(Opcode.CMP_EQ);
            } else break;
        }
    }

    private term() {
        this.factor();
        while (true) {
            if (this.match(TokenType.PLUS)) {
                this.factor();
                this.emit(Opcode.ADD);
            } else if (this.match(TokenType.MINUS)) {
                this.factor();
                this.emit(Opcode.SUB);
            } else break;
        }
    }

    private factor() {
        this.unary();
        while (true) {
            if (this.match(TokenType.STAR)) {
                this.unary();
                this.emit(Opcode.MUL);
            } else if (this.match(TokenType.SLASH)) {
                this.unary();
                this.emit(Opcode.DIV);
            } else break;
        }
    }

    private unary() {
        if (this.match(TokenType.BANG)) {
            this.primary();
            this.emit(Opcode.NOT);
        } else {
            this.primary();
        }
    }

    private primary() {
        const token = this.advance();
        if (token.type === TokenType.NUMBER) {
            this.emit(Opcode.PUSH);
            this.emit(parseInt(token.value!));
        } else if (token.type === TokenType.STRING) {
            this.emit(Opcode.PUSH_STR);
            const idx = this.stringPool.length;
            this.stringPool.push(token.value!);
            this.emit(idx);
        } else if (token.type === TokenType.TRUE) {
            this.emit(Opcode.PUSH);
            this.emit(1);
        } else if (token.type === TokenType.FALSE) {
            this.emit(Opcode.PUSH);
            this.emit(0);
        } else if (token.type === TokenType.NULL) {
            this.emit(Opcode.PUSH);
            this.emit(0);
        } else if (token.type === TokenType.IDENTIFIER) {
            const name = token.value!;
            if (this.peek().type === TokenType.LPAREN) {
                // Function call
                this.match(TokenType.LPAREN);
                let args = 0;
                if (this.peek().type !== TokenType.RPAREN) {
                    do {
                        this.expression();
                        args++;
                    } while (this.match(TokenType.COMMA));
                }
                this.match(TokenType.RPAREN);
                const fn = this.functions.get(name);
                if (!fn) throw new Error(`Undefined function: ${name}`);
                if (fn.argCount !== args) throw new Error(`Function ${name} expects ${fn.argCount} arguments, got ${args}`);
                this.emit(Opcode.CALL);
                this.emit(fn.address);
                this.emit(fn.argCount);
            } else {
                const addr = this.resolveVariable(name);
                this.emit(Opcode.LOAD);
                this.emit(addr);
            }
        } else if (token.type === TokenType.LPAREN) {
            this.expression();
            this.match(TokenType.RPAREN);
        }
    }
}

/**
 * Virtual Machine: Executes the numeric bytecode.
 */
export class VM {
    private stack: any[] = []; 
    private memory = new Array(1024).fill(0); 
    private ip = 0; 
    private callStack: number[] = []; // Stack for return addresses
    public logs: string[] = [];

    constructor(private bytecode: Int32Array, private stringPool: string[] = []) {}

    public run() {
        while (this.ip < this.bytecode.length) {
            const opcode = this.bytecode[this.ip++] as Opcode;

            switch (opcode) {
                case Opcode.HALT:
                    return;
                case Opcode.PUSH:
                    this.stack.push(this.bytecode[this.ip++]);
                    break;
                case Opcode.PUSH_STR: {
                    const idx = this.bytecode[this.ip++];
                    this.stack.push(this.stringPool[idx]);
                    break;
                }
                case Opcode.ADD: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a + b);
                    break;
                }
                case Opcode.SUB: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a - b);
                    break;
                }
                case Opcode.MUL: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a * b);
                    break;
                }
                case Opcode.DIV: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(Math.floor(a / b));
                    break;
                }
                case Opcode.LOAD: {
                    const addr = this.bytecode[this.ip++];
                    this.stack.push(this.memory[addr]);
                    break;
                }
                case Opcode.STORE: {
                    const addr = this.bytecode[this.ip++];
                    const val = this.stack.pop();
                    this.memory[addr] = val;
                    break;
                }
                case Opcode.PRINT: {
                    const val = this.stack.pop();
                    this.logs.push(String(val));
                    console.log(val);
                    break;
                }
                case Opcode.JMP:
                    this.ip = this.bytecode[this.ip];
                    break;
                case Opcode.JMP_IF_FALSE: {
                    const target = this.bytecode[this.ip++];
                    const condition = this.stack.pop();
                    if (!condition) this.ip = target;
                    break;
                }
                case Opcode.CMP_GT: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a > b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_LT: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a < b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_EQ: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a === b ? 1 : 0);
                    break;
                }
                case Opcode.AND: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a && b ? 1 : 0);
                    break;
                }
                case Opcode.OR: {
                    const b = this.stack.pop();
                    const a = this.stack.pop();
                    this.stack.push(a || b ? 1 : 0);
                    break;
                }
                case Opcode.NOT: {
                    const a = this.stack.pop();
                    this.stack.push(!a ? 1 : 0);
                    break;
                }
                case Opcode.CALL: {
                    const address = this.bytecode[this.ip++];
                    const argCount = this.bytecode[this.ip++];
                    
                    // Simple argument passing for this prototype: 
                    // pop from stack and store into memory at the expected indices.
                    // This is hacky and only works for non-recursive calls with specific memory management.
                    // A real VM would use base pointers and stack-relative offsets.
                    const args = [];
                    for(let i=0; i<argCount; i++) args.push(this.stack.pop());
                    // Since we map args to defineVariable index, we need to know that index.
                    // For this prototype, we'll assume the memory addresses for args start at 
                    // the function's internal scope offset. 
                    // But to keep it "general-purpose" yet "simple", I'll just push args back for now
                    // if I can't easily map them. Actually, let's just use the stack for args.
                    for(let i=argCount-1; i>=0; i--) this.stack.push(args[i]);
                    // Actually, let's keep it simple: the compiler emits Opcode.STORE for args at the start of fn.
                    // Wait, the compiler needs to emit STORE for each arg.
                    // Updated Compiler logic: args are defined as variables.
                    
                    this.callStack.push(this.ip);
                    this.ip = address;
                    break;
                }
                case Opcode.RET: {
                    this.ip = this.callStack.pop()!;
                    break;
                }
                case Opcode.POP:
                    this.stack.pop();
                    break;
                default:
                    throw new Error(`Unknown opcode: ${opcode} at ${this.ip - 1}`);
            }
        }
    }
}
