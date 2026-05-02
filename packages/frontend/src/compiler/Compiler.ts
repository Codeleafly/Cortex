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
                this.emit(Opcode.RET);

                this.bytecode[jumpOverIdx] = this.bytecode.length;
                break;
            }
            case 'IfStmt': {
                this.expression(stmt.condition);
                this.emit(Opcode.JMP_IF_FALSE);
                const jumpOffsetIdx = this.bytecode.length;
                this.emit(0); 

                for (const thenStmt of stmt.thenBranch) {
                    this.statement(thenStmt);
                }

                this.bytecode[jumpOffsetIdx] = this.bytecode.length;
                break;
            }
            case 'WhileStmt': {
                const loopStart = this.bytecode.length;
                this.expression(stmt.condition);
                
                this.emit(Opcode.JMP_IF_FALSE);
                const jumpOffsetIdx = this.bytecode.length;
                this.emit(0); 

                for (const bodyStmt of stmt.body) {
                    this.statement(bodyStmt);
                }

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
                    case TokenType.AND_AND: this.emit(Opcode.AND); break;
                    case TokenType.OR_OR: this.emit(Opcode.OR); break;
                }
                break;
            case 'UnaryExpr':
                this.expression(expr.right);
                if (expr.operator.type === TokenType.BANG) this.emit(Opcode.NOT);
                break;
            case 'LiteralExpr':
                if (typeof expr.value === 'number') {
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
