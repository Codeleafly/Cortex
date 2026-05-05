import { Opcode, TokenType } from '@nox/shared';
import { Stmt, Expr } from '../parser/AST.js';

/**
 * One-pass Compiler: Emits bytecode by walking the AST.
 */
export class Compiler {
    private bytecode: number[] = [];
    private stringPool: string[] = [];
    private scopes: Map<string, { address: number, isMutable: boolean }>[] = [new Map()]; 
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

    private resolveVariable(name: string): { address: number, isMutable: boolean } {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                const info = this.scopes[i].get(name)!;
                // If we are at the top level (not in a function), all scopes are global
                if (this.functionStartScopeIndex === 0) return { address: ~info.address, isMutable: info.isMutable };
                // If we are in a function, only scope 0 is global
                if (i === 0) return { address: ~info.address, isMutable: info.isMutable };
                
                // If the variable is in an outer function's scope, we can't access it (no closures yet)
                if (i < this.functionStartScopeIndex) {
                    throw new Error(`Closure Error: Cannot access non-global variable '${name}' from nested function. Closures are not yet supported.`);
                }

                return info; // Local
            }
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    private defineVariable(name: string, isMutable: boolean) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (!currentScope.has(name)) {
            let offset = 0;
            // Count variables in scopes belonging to the current function
            for (let i = this.functionStartScopeIndex; i < this.scopes.length; i++) {
                offset += this.scopes[i].size;
            }
            currentScope.set(name, { address: offset, isMutable });
        }
        
        const info = currentScope.get(name)!;
        if (this.functionStartScopeIndex === 0) return ~info.address; // Global
        return info.address; // Local
    }

    private statement(stmt: Stmt) {
        switch (stmt.type) {
            case 'LetStmt': {
                this.expression(stmt.initializer);
                const addr = this.defineVariable(stmt.name, stmt.isMutable);
                this.emit(Opcode.STORE);
                this.emit(addr);
                break;
            }
            case 'AssignStmt': {
                const info = this.resolveVariable(stmt.name);
                if (!info.isMutable) {
                    throw new Error(`Immutable Error: Cannot re-assign constant variable '${stmt.name}'. Use 'mut' to declare mutable variables.`);
                }
                this.expression(stmt.value);
                this.emit(Opcode.STORE);
                this.emit(info.address);
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
                    const addr = this.defineVariable(stmt.params[i], true); // Params are mutable by default
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

                this.scopes.push(new Map());
                for (const thenStmt of stmt.thenBranch) {
                    this.statement(thenStmt);
                }
                this.scopes.pop();

                if (stmt.elseBranch) {
                    this.emit(Opcode.JMP);
                    const jumpToEndIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.bytecode[jumpToElseIdx] = this.bytecode.length;
                    
                    this.scopes.push(new Map());
                    for (const elseStmt of stmt.elseBranch) {
                        this.statement(elseStmt);
                    }
                    this.scopes.pop();
                    
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

                this.scopes.push(new Map());
                for (const bodyStmt of stmt.body) {
                    this.statement(bodyStmt);
                }
                this.scopes.pop();

                this.emit(Opcode.JMP);
                this.emit(loopStart);

                this.bytecode[jumpOffsetIdx] = this.bytecode.length;
                break;
            }
            case 'ForStmt': {
                // Desugar for item in iterable { body } 
                // mut _iter = iterable;
                // while _iter.hasNext() { item = _iter.next(); body }
                // For now, implement simple array iteration if we had arrays.
                // Let's implement it using a new ITER_NEXT opcode.
                this.expression(stmt.iterable);
                const loopStart = this.bytecode.length;
                this.emit(Opcode.ITER_NEXT);
                const jumpOffsetIdx = this.bytecode.length;
                this.emit(0); // Jump to end if no more items

                // Define loop variable
                const addr = this.defineVariable(stmt.item, true);
                this.emit(Opcode.STORE);
                this.emit(addr);

                this.scopes.push(new Map());
                for (const bodyStmt of stmt.body) {
                    this.statement(bodyStmt);
                }
                this.scopes.pop();

                this.emit(Opcode.JMP);
                this.emit(loopStart);
                this.bytecode[jumpOffsetIdx] = this.bytecode.length;
                break;
            }
            case 'MatchStmt': {
                this.expression(stmt.expression);
                const endJumps: number[] = [];

                for (const c of stmt.cases) {
                    if (c.condition === null) {
                        // Default case
                        for (const s of c.body) this.statement(s);
                        break; 
                    } else {
                        this.emit(Opcode.DUP); // Duplicate value to compare
                        this.expression(c.condition);
                        this.emit(Opcode.CMP_EQ);
                        this.emit(Opcode.JMP_IF_FALSE);
                        const nextCaseIdx = this.bytecode.length;
                        this.emit(0);

                        for (const s of c.body) this.statement(s);
                        
                        this.emit(Opcode.JMP);
                        endJumps.push(this.bytecode.length);
                        this.emit(0);

                        this.bytecode[nextCaseIdx] = this.bytecode.length;
                    }
                }
                
                const popAddr = this.bytecode.length;
                this.emit(Opcode.POP); // Pop the match expression value
                for (const idx of endJumps) this.bytecode[idx] = popAddr;
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
                    this.emit(Opcode.DUP);
                    this.emit(Opcode.JMP_IF_FALSE);
                    const jumpToFalseIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.emit(Opcode.POP);
                    this.expression(expr.right);
                    
                    this.bytecode[jumpToFalseIdx] = this.bytecode.length;
                } else if (expr.operator.type === TokenType.OR_OR) {
                    this.expression(expr.left);
                    this.emit(Opcode.DUP);
                    this.emit(Opcode.JMP_IF_TRUE);
                    const jumpToTrueIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.emit(Opcode.POP);
                    this.expression(expr.right);
                    
                    this.bytecode[jumpToTrueIdx] = this.bytecode.length;
                } else if (expr.operator.type === TokenType.PIPE) {
                    // a |> b(c) => b(a, c)
                    // Syntactic sugar: b must be a CallExpr or Identifier
                    if (expr.right.type === 'CallExpr') {
                        // Prepend 'left' to args
                        const call = expr.right;
                        this.expression(expr.left);
                        for (const arg of call.args) this.expression(arg);
                        
                        const builtins: Record<string, { opcode: Opcode, args: number }> = {
                            'str_upper': { opcode: Opcode.STR_UPPER, args: 1 },
                            'print': { opcode: Opcode.PRINT, args: 1 } // Support print as a pseudo-builtin
                        };

                        if (call.callee in builtins) {
                             this.emit(builtins[call.callee].opcode);
                        } else {
                            const fn = this.functions.get(call.callee);
                            if (!fn) throw new Error(`Undefined function in pipe: ${call.callee}`);
                            this.emit(Opcode.CALL);
                            this.emit(fn.address);
                            this.emit(call.args.length + 1);
                        }
                    } else if (expr.right.type === 'VariableExpr') {
                        // simple function name
                        this.expression(expr.left);
                        const fn = this.functions.get(expr.right.name);
                        const builtins: Record<string, { opcode: Opcode, args: number }> = {
                            'str_upper': { opcode: Opcode.STR_UPPER, args: 1 },
                            'print': { opcode: Opcode.PRINT, args: 1 }
                        };
                        if (expr.right.name in builtins) {
                            this.emit(builtins[expr.right.name].opcode);
                        } else if (fn) {
                            this.emit(Opcode.CALL);
                            this.emit(fn.address);
                            this.emit(1);
                        } else {
                             throw new Error(`Undefined function in pipe: ${expr.right.name}`);
                        }
                    }
                } else if (expr.operator.type === TokenType.QUESTION_DOT) {
                    // a?.b
                    this.expression(expr.left);
                    this.emit(Opcode.DUP);
                    this.emit(Opcode.PUSH);
                    this.emit(0); // push null
                    this.emit(Opcode.CMP_EQ);
                    this.emit(Opcode.JMP_IF_TRUE);
                    const jumpToNullIdx = this.bytecode.length;
                    this.emit(0);
                    
                    // Access property
                    this.expression(expr.right); // property name is pushed as string
                    this.emit(Opcode.DICT_GET);
                    
                    this.bytecode[jumpToNullIdx] = this.bytecode.length;
                } else if (expr.operator.type === TokenType.NULL_COAL) {
                    // a ?? b
                    this.expression(expr.left);
                    this.emit(Opcode.DUP);
                    this.emit(Opcode.PUSH);
                    this.emit(0); // push null
                    this.emit(Opcode.CMP_NEQ); // if not null
                    this.emit(Opcode.JMP_IF_TRUE);
                    const jumpToResultIdx = this.bytecode.length;
                    this.emit(0);
                    
                    this.emit(Opcode.POP); // pop the null
                    this.expression(expr.right);
                    
                    this.bytecode[jumpToResultIdx] = this.bytecode.length;
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
                        case TokenType.GT_EQ: this.emit(Opcode.CMP_GE); break;
                        case TokenType.LT_EQ: this.emit(Opcode.CMP_LE); break;
                        case TokenType.EQ_EQ: this.emit(Opcode.CMP_EQ); break;
                        case TokenType.BANG_EQ: this.emit(Opcode.CMP_NEQ); break;
                    }
                }
                break;
            case 'UnaryExpr':
                this.expression(expr.right);
                if (expr.operator.type === TokenType.BANG) {
                    if (expr.kind === 'prefix') {
                        this.emit(Opcode.NOT);
                    } else {
                        this.emit(Opcode.AWAIT);
                    }
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
                this.emit(this.resolveVariable(expr.name).address);
                break;
            case 'CallExpr': {
                const builtins: Record<string, { opcode: Opcode, args: number }> = {
                    'get_arg': { opcode: Opcode.GET_ARG, args: 1 },
                    'to_number': { opcode: Opcode.TO_NUMBER, args: 1 },
                    'read_file': { opcode: Opcode.READ_FILE, args: 1 },
                    'write_file': { opcode: Opcode.WRITE_FILE, args: 2 },
                    'file_exists': { opcode: Opcode.FILE_EXISTS, args: 1 },
                    'str_upper': { opcode: Opcode.STR_UPPER, args: 1 },
                    'str_words': { opcode: Opcode.STR_WORDS, args: 1 },
                    'read_line': { opcode: Opcode.READ_LINE, args: 0 },
                    'str_at': { opcode: Opcode.STR_AT, args: 2 },
                    'str_len': { opcode: Opcode.STR_LEN, args: 1 },
                    'run_command': { opcode: Opcode.RUN_CMD, args: 1 }
                };

                if (expr.callee in builtins) {
                    const info = builtins[expr.callee];
                    if (expr.args.length !== info.args) {
                        throw new Error(`Compiler Error: Built-in function '${expr.callee}' expects ${info.args} arguments, but got ${expr.args.length}.`);
                    }
                    for (const arg of expr.args) {
                        this.expression(arg);
                    }
                    this.emit(info.opcode);
                } else {
                    for (const arg of expr.args) {
                        this.expression(arg);
                    }
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
            case 'DictExpr':
                for (const entry of expr.entries) {
                    this.emit(Opcode.PUSH_STR);
                    const idx = this.stringPool.length;
                    this.stringPool.push(entry.key);
                    this.emit(idx);
                    this.expression(entry.value);
                }
                this.emit(Opcode.DICT_BUILD);
                this.emit(expr.entries.length);
                break;
            case 'RangeExpr':
                this.expression(expr.start);
                this.expression(expr.end);
                this.emit(Opcode.RANGE);
                break;
        }
    }
}
