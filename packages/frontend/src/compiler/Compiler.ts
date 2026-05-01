import { Opcode, TokenType, Token } from '@cortex/shared';

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
    private functions = new Map<string, { address: number, argCount: number }>();

    constructor() {}

    // Initialize or continue compiling
    public compile(tokens: Token[]): { bytecode: Int32Array, stringPool: string[] } {
        this.tokens = tokens;
        this.pos = 0;
        this.bytecode = []; // Fresh bytecode for this run, but scopes remain!
        
        while (this.peek().type !== TokenType.EOF) {
            this.statement();
        }
        this.emit(Opcode.HALT);
        return { 
            bytecode: new Int32Array(this.bytecode), 
            stringPool: this.stringPool 
        };
    }
    
    // For REPL persistence: Appends bytecode but keeps string pool and scopes intact.
    public compileSnippet(tokens: Token[]): { bytecode: Int32Array, stringPool: string[], startIp: number } {
        this.tokens = tokens;
        this.pos = 0;
        const startIp = this.bytecode.length;
        
        while (this.peek().type !== TokenType.EOF) {
            this.statement();
        }
        this.emit(Opcode.HALT);
        return { 
            bytecode: new Int32Array(this.bytecode), 
            stringPool: this.stringPool,
            startIp
        };
    }

    private peek() { return this.tokens[this.pos]; }
    private advance() { return this.tokens[this.pos++]; }
    private match(type: TokenType) {
        if (this.peek().type === type) {
            return this.advance();
        }
        return null;
    }
    
    // Helper for optional semicolons
    private consumeSemicolon() {
        this.match(TokenType.SEMICOLON);
    }

    private emit(op: number) { this.bytecode.push(op); }

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

    private statement() {
        if (this.match(TokenType.LET)) {
            const name = this.advance().value!;
            this.match(TokenType.EQUALS);
            this.expression();
            this.consumeSemicolon();
            const addr = this.defineVariable(name);
            this.emit(Opcode.STORE);
            this.emit(addr);
        } else if (this.peek().type === TokenType.IDENTIFIER && this.tokens[this.pos + 1]?.type === TokenType.EQUALS) {
            // Assignment: name = expression;
            const name = this.advance().value!;
            this.match(TokenType.EQUALS);
            this.expression();
            this.consumeSemicolon();
            const addr = this.resolveVariable(name);
            this.emit(Opcode.STORE);
            this.emit(addr);
        } else if (this.match(TokenType.PRINT)) {
            this.expression();
            this.consumeSemicolon();
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
            // Emit STORE for each argument
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
            this.consumeSemicolon();
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
            this.consumeSemicolon();
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
        } else if (token.type === TokenType.ARG_COUNT) {
            this.emit(Opcode.ARG_COUNT);
        } else if (token.type === TokenType.GET_ARG) {
            this.match(TokenType.LPAREN);
            this.expression();
            this.match(TokenType.RPAREN);
            this.emit(Opcode.GET_ARG);
        } else if (token.type === TokenType.TO_NUMBER) {
            this.match(TokenType.LPAREN);
            this.expression();
            this.match(TokenType.RPAREN);
            this.emit(Opcode.TO_NUMBER);
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
