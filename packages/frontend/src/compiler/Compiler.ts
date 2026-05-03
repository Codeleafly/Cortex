import { Opcode, TokenType } from '@cortex/shared';
import { Stmt, Expr } from '../parser/AST.js';

/**
 * One-pass Compiler: Emits bytecode by walking the AST.
 */
export class Compiler {
    private bytecode: number[] = [];
    private stringPool: string[] = [];
    private scopes: Map<string, number>[] = [new Map()]; 
    private functions = new Map<string, { address: number, argCount: number }>();
    private functionStartScopeIndex = 0;

    constructor() {}

    public compile(statements: Stmt[]): { bytecode: Int32Array, stringPool: string[] } {
        this.bytecode = [];
        for (const stmt of statements) {
            this.statement(stmt);
        }
        this.emit(Opcode.HALT);
        return { 
            bytecode: new Int32Array(this.bytecode), 
            stringPool: this.stringPool 
        };
    }
    
    public compileSnippet(statements: Stmt[]): { bytecode: Int32Array, stringPool: string[], startIp: number } {
        const startIp = this.bytecode.length;
        for (const stmt of statements) {
            this.statement(stmt);
        }
        this.emit(Opcode.HALT);
        return { 
            bytecode: new Int32Array(this.bytecode), 
            stringPool: this.stringPool,
            startIp
        };
    }

    private emit(op: number) { this.bytecode.push(op); }

    private getCurrentOffset(): number {
        let offset = 0;
        for (let i = this.functionStartScopeIndex; i < this.scopes.length; i++) {
            offset += this.scopes[i].size;
        }
        return offset;
    }

    private reclaimOffset(offset: number) {
        // This is a no-op at compile-time but documents the intent.
        // The defineVariable logic already uses the current cumulative size.
    }

    private resolveVariable(name: string): number {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                const addr = this.scopes[i].get(name)!;
                // If we are at the top level (not in a function), all scopes are global
                if (this.functionStartScopeIndex === 0) return ~addr;
                // If we are in a function, only scope 0 is global
                if (i === 0) return ~addr;
                
                // If the variable is in an outer function's scope, we can't access it (no closures yet)
                if (i < this.functionStartScopeIndex) {
                    throw new Error(`Closure Error: Cannot access non-global variable '${name}' from nested function. Closures are not yet supported.`);
                }

                return addr; // Local
            }
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    private defineVariable(name: string) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (!currentScope.has(name)) {
            let offset = 0;
            // Count variables in scopes belonging to the current function
            for (let i = this.functionStartScopeIndex; i < this.scopes.length; i++) {
                offset += this.scopes[i].size;
            }
            currentScope.set(name, offset);
        }
        
        const addr = currentScope.get(name)!;
        if (this.functionStartScopeIndex === 0) return ~addr; // Global
        return addr; // Local
    }

    private statement(stmt: Stmt) {
        switch (stmt.type) {
            case 'LetStmt': {
                this.expression(stmt.initializer);
                const addr = this.defineVariable(stmt.name);
                this.emit(Opcode.STORE);
                this.emit(addr);
                break;
            }
            case 'AssignStmt': {
                this.expression(stmt.value);
                const addr = this.resolveVariable(stmt.name);
                this.emit(Opcode.STORE);
                this.emit(addr);
                break;
            }
            case 'PrintStmt':
                this.expression(stmt.expression);
                this.emit(Opcode.PRINT);
                break;
            case 'FnStmt': {
                this.emit(Opcode.JMP);
                const jumpOverIdx = this.bytecode.length;
                this.emit(0); 

                const fnStart = this.bytecode.length;
                this.functions.set(stmt.name, { address: fnStart, argCount: stmt.params.length });

                const oldStartScope = this.functionStartScopeIndex;
                this.functionStartScopeIndex = this.scopes.length;

                this.scopes.push(new Map());
                for (let i = stmt.params.length - 1; i >= 0; i--) {
                    const addr = this.defineVariable(stmt.params[i]);
                    this.emit(Opcode.STORE);
                    this.emit(addr);
                }
                
                for (const bodyStmt of stmt.body) {
                    this.statement(bodyStmt);
                }
                
                this.scopes.pop();
                this.functionStartScopeIndex = oldStartScope;
                
                // Ensure every function returns a value (even null)
                this.emit(Opcode.PUSH);
                this.emit(0); // literal null = 0
                this.emit(Opcode.RET);

                this.bytecode[jumpOverIdx] = this.bytecode.length;
                break;
            }
            case 'IfStmt': {
                this.expression(stmt.condition);
                this.emit(Opcode.JMP_IF_FALSE);
                const jumpToElseIdx = this.bytecode.length;
                this.emit(0); 

                // Track starting offset for memory reclamation
                const startOffset = this.getCurrentOffset();
                this.scopes.push(new Map());
                for (const thenStmt of stmt.thenBranch) {
                    this.statement(thenStmt);
                }
                this.scopes.pop();
                this.reclaimOffset(startOffset);

                if (stmt.elseBranch) {
                    this.emit(Opcode.JMP);
                    const jumpToEndIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.bytecode[jumpToElseIdx] = this.bytecode.length;
                    
                    const elseStartOffset = this.getCurrentOffset();
                    this.scopes.push(new Map());
                    for (const elseStmt of stmt.elseBranch) {
                        this.statement(elseStmt);
                    }
                    this.scopes.pop();
                    this.reclaimOffset(elseStartOffset);
                    
                    this.bytecode[jumpToEndIdx] = this.bytecode.length;
                } else {
                    this.bytecode[jumpToElseIdx] = this.bytecode.length;
                }
                break;
            }
            case 'WhileStmt': {
                const loopStart = this.bytecode.length;
                this.expression(stmt.condition);
                
                this.emit(Opcode.JMP_IF_FALSE);
                const jumpOffsetIdx = this.bytecode.length;
                this.emit(0); 

                const startOffset = this.getCurrentOffset();
                this.scopes.push(new Map());
                for (const bodyStmt of stmt.body) {
                    this.statement(bodyStmt);
                }
                this.scopes.pop();
                this.reclaimOffset(startOffset);

                this.emit(Opcode.JMP);
                this.emit(loopStart);

                this.bytecode[jumpOffsetIdx] = this.bytecode.length;
                break;
            }
            case 'ReturnStmt':
                this.expression(stmt.value);
                this.emit(Opcode.RET);
                break;
            case 'ExprStmt':
                this.expression(stmt.expression);
                this.emit(Opcode.POP);
                break;
        }
    }

    private expression(expr: Expr) {
        switch (expr.type) {
            case 'BinaryExpr':
                if (expr.operator.type === TokenType.AND_AND) {
                    this.expression(expr.left);
                    this.emit(Opcode.JMP_IF_FALSE);
                    const jumpToFalseIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.expression(expr.right);
                    this.emit(Opcode.JMP);
                    const jumpToEndIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.bytecode[jumpToFalseIdx] = this.bytecode.length;
                    this.emit(Opcode.PUSH);
                    this.emit(0);
                    
                    this.bytecode[jumpToEndIdx] = this.bytecode.length;
                } else if (expr.operator.type === TokenType.OR_OR) {
                    this.expression(expr.left);
                    this.emit(Opcode.JMP_IF_TRUE);
                    const jumpToTrueIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.expression(expr.right);
                    this.emit(Opcode.JMP);
                    const jumpToEndIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.bytecode[jumpToTrueIdx] = this.bytecode.length;
                    this.emit(Opcode.PUSH);
                    this.emit(1);
                    
                    this.bytecode[jumpToEndIdx] = this.bytecode.length;
                } else {
                    this.expression(expr.left);
                    this.expression(expr.right);
                    switch (expr.operator.type) {
                        case TokenType.PLUS: this.emit(Opcode.ADD); break;
                        case TokenType.MINUS: this.emit(Opcode.SUB); break;
                        case TokenType.STAR: this.emit(Opcode.MUL); break;
                        case TokenType.SLASH: this.emit(Opcode.DIV); break;
                        case TokenType.GT: this.emit(Opcode.CMP_GT); break;
                        case TokenType.LT: this.emit(Opcode.CMP_LT); break;
                        case TokenType.EQ_EQ: this.emit(Opcode.CMP_EQ); break;
                        case TokenType.BANG_EQ: this.emit(Opcode.CMP_NEQ); break;
                    }
                }
                break;
            case 'UnaryExpr':
                this.expression(expr.right);
                if (expr.operator.type === TokenType.BANG) {
                    this.emit(Opcode.NOT);
                } else if (expr.operator.type === TokenType.MINUS) {
                    this.emit(Opcode.PUSH);
                    this.emit(-1);
                    this.emit(Opcode.MUL);
                }
                break;
            case 'LiteralExpr':
                if (typeof expr.value === 'number') {
                    if (expr.value > 2147483647 || expr.value < -2147483648) {
                        throw new Error(`Integer Overflow: Numeric literal ${expr.value} exceeds 32-bit signed integer range.`);
                    }
                    this.emit(Opcode.PUSH);
                    this.emit(expr.value);
                } else if (typeof expr.value === 'string') {
                    this.emit(Opcode.PUSH_STR);
                    const idx = this.stringPool.length;
                    this.stringPool.push(expr.value);
                    this.emit(idx);
                } else if (expr.value === true) {
                    this.emit(Opcode.PUSH);
                    this.emit(1);
                } else if (expr.value === false || expr.value === null) {
                    this.emit(Opcode.PUSH);
                    this.emit(0);
                }
                break;
            case 'VariableExpr':
                this.emit(Opcode.LOAD);
                this.emit(this.resolveVariable(expr.name));
                break;
            case 'CallExpr': {
                for (const arg of expr.args) {
                    this.expression(arg);
                }
                if (expr.callee === 'get_arg') {
                    this.emit(Opcode.GET_ARG);
                } else if (expr.callee === 'to_number') {
                    this.emit(Opcode.TO_NUMBER);
                } else if (expr.callee === 'read_file') {
                    this.emit(Opcode.READ_FILE);
                } else if (expr.callee === 'write_file') {
                    this.emit(Opcode.WRITE_FILE);
                } else if (expr.callee === 'file_exists') {
                    this.emit(Opcode.FILE_EXISTS);
                } else if (expr.callee === 'str_upper') {
                    this.emit(Opcode.STR_UPPER);
                } else if (expr.callee === 'str_words') {
                    this.emit(Opcode.STR_WORDS);
                } else if (expr.callee === 'read_line') {
                    this.emit(Opcode.READ_LINE);
                } else if (expr.callee === 'str_at') {
                    this.emit(Opcode.STR_AT);
                } else if (expr.callee === 'str_len') {
                    this.emit(Opcode.STR_LEN);
                } else if (expr.callee === 'run_command') {
                    this.emit(Opcode.RUN_CMD);
                } else {
                    const fn = this.functions.get(expr.callee);
                    if (!fn) throw new Error(`Undefined function: ${expr.callee}`);
                    if (fn.argCount !== expr.args.length) throw new Error(`Function ${expr.callee} expects ${fn.argCount} arguments, got ${expr.args.length}`);
                    this.emit(Opcode.CALL);
                    this.emit(fn.address);
                    this.emit(fn.argCount);
                }
                break;
            }
            case 'GroupingExpr':
                this.expression(expr.expression);
                break;
            case 'ArgCountExpr':
                this.emit(Opcode.ARG_COUNT);
                break;
        }
    }
}
