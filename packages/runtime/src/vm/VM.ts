import { Opcode } from '@cortex/shared';
import { RuntimeError } from './RuntimeError.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline-sync';
import { execSync } from 'child_process';

type StackValue = number | string | boolean | null;

interface Permissions {
    read: boolean;
    write: boolean;
    run: boolean;
}

/**
 * Virtual Machine: Executes the numeric bytecode.
 */
export class VM {
    private stack: StackValue[] = []; 
    private memory: StackValue[] = new Array(1024).fill(null); 
    private globals: StackValue[] = new Array(512).fill(null); 
    private ip = 0; 
    private bp = 0; 
    private memoryStackPointer = 0; 
    private callStack: { returnAddr: number, oldBp: number }[] = []; 
    public logs: string[] = [];
    
    private bytecode: Int32Array = new Int32Array(0);
    private stringPool: string[] = [];
    private args: string[] = [];

    private permissions: Permissions = {
        read: false,
        write: false,
        run: false
    };
    private isInteractive = true;

    constructor(initialPermissions?: Partial<Permissions>, interactive = true) {
        if (initialPermissions) {
            this.permissions = { ...this.permissions, ...initialPermissions };
        }
        this.isInteractive = interactive;
    }

    private checkPermission(type: keyof Permissions, target?: string): void {
        if (this.permissions[type]) return;

        if (!this.isInteractive) {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied (Non-interactive mode)`, this.ip);
        }

        console.warn(`\x1b[33m╔════ Security Alert ════════════════════════════════════════════════════╗\x1b[0m`);
        console.warn(`\x1b[33m║\x1b[0m Cortex script is requesting \x1b[1m${type.toUpperCase()}\x1b[0m access${target ? ' to: ' + target : ''}`);
        console.warn(`\x1b[33m╚════════════════════════════════════════════════════════════════════════╝\x1b[0m`);
        
        const answer = readline.question(`Allow this operation? (y/n): `);
        if (answer.toLowerCase() === 'y') {
            this.permissions[type] = true;
            console.log(`\x1b[32mPermission granted.\x1b[0m`);
        } else {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied by user.`, this.ip);
        }
    }

    private readOperand(): number {
        if (this.ip >= this.bytecode.length) {
            throw new RuntimeError('Unexpected end of bytecode: missing operand', this.ip);
        }
        return this.bytecode[this.ip++];
    }

    private push(val: StackValue) {
        if (this.stack.length >= 1024) {
            throw new RuntimeError('Stack Overflow', this.ip);
        }
        this.stack.push(val);
    }

    private pop(): StackValue {
        if (this.stack.length === 0) {
            throw new RuntimeError('Stack Underflow', this.ip);
        }
        return this.stack.pop()!;
    }

    private peek(): StackValue {
        if (this.stack.length === 0) {
            throw new RuntimeError('Stack Underflow (peek)', this.ip);
        }
        return this.stack[this.stack.length - 1];
    }

    private safeResolve(userPath: string): string {
        const resolved = path.resolve(userPath);
        if (!resolved.startsWith(process.cwd())) {
            throw new RuntimeError(`Security Error: Sandbox escape attempt for path: ${userPath}`, this.ip);
        }

        // Deep check for symlink escapes if the path exists
        try {
            if (fs.existsSync(resolved)) {
                const real = fs.realpathSync(resolved);
                if (!real.startsWith(process.cwd())) {
                    throw new RuntimeError(`Security Error: Symlink sandbox escape attempt for path: ${userPath}`, this.ip);
                }
            }
        } catch (e) {
            // Handle cases where permissions or other fs issues occur
            throw new RuntimeError(`Security Error: Failed to verify path safety: ${userPath}`, this.ip);
        }

        return resolved;
    }

    public run(bytecode: Int32Array, stringPool: string[] = [], args: string[] = []) {
        this.bytecode = bytecode;
        this.stringPool = stringPool;
        this.args = args;
        this.ip = 0;
        this.bp = 0;
        this.memoryStackPointer = 0;
        this.logs = [];
        this.stack = [];
        this.callStack = [];
        this.globals.fill(null);
        this.execute();
    }

    public runSnippet(bytecode: Int32Array, stringPool: string[], startIp: number, args: string[] = []) {
        this.bytecode = bytecode;
        this.stringPool = stringPool;
        this.args = args;
        this.ip = startIp;
        this.logs = [];
        // Note: we don't reset stack/callStack for snippets in REPL to maintain state
        this.execute();
    }

    private execute() {
        while (this.ip < this.bytecode.length) {
            const opcode = this.bytecode[this.ip++] as Opcode;

            switch (opcode) {
                case Opcode.HALT:
                    return;
                case Opcode.PUSH:
                    this.push(this.readOperand());
                    break;
                case Opcode.PUSH_STR: {
                    const idx = this.readOperand();
                    this.push(this.stringPool[idx]);
                    break;
                }
                case Opcode.ADD: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a === 'number' && typeof b === 'number') {
                        this.push(a + b);
                    } else if (typeof a === 'string' || typeof b === 'string') {
                        this.push(String(a) + String(b));
                    } else {
                        throw new RuntimeError(`Invalid types for ADD: ${typeof a} and ${typeof b}`, this.ip);
                    }
                    break;
                }
                case Opcode.SUB: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('SUB requires numeric operands', this.ip);
                    }
                    this.push(a - b);
                    break;
                }
                case Opcode.MUL: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('MUL requires numeric operands', this.ip);
                    }
                    this.push(a * b);
                    break;
                }
                case Opcode.DIV: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('DIV requires numeric operands', this.ip);
                    }
                    if (b === 0) throw new RuntimeError('Division by zero', this.ip);
                    this.push(Math.floor(a / b));
                    break;
                }
                case Opcode.LOAD: {
                    const addr = this.readOperand();
                    if (addr < 0) {
                        const finalAddr = ~addr;
                        if (finalAddr < 0 || finalAddr >= this.globals.length) {
                            throw new RuntimeError(`Invalid global address: ${finalAddr}`, this.ip);
                        }
                        this.push(this.globals[finalAddr]);
                    } else {
                        const finalAddr = this.bp + addr;
                        if (finalAddr < 0 || finalAddr >= this.memory.length) {
                            throw new RuntimeError(`Invalid memory address: ${finalAddr} (bp: ${this.bp})`, this.ip);
                        }
                        this.push(this.memory[finalAddr]);
                    }
                    break;
                }
                case Opcode.STORE: {
                    const addr = this.readOperand();
                    const val = this.pop();
                    if (addr < 0) {
                        const finalAddr = ~addr;
                        if (finalAddr < 0 || finalAddr >= this.globals.length) {
                            throw new RuntimeError(`Invalid global address: ${finalAddr}`, this.ip);
                        }
                        this.globals[finalAddr] = val;
                    } else {
                        const finalAddr = this.bp + addr;
                        if (finalAddr < 0 || finalAddr >= this.memory.length) {
                            throw new RuntimeError(`Invalid memory address: ${finalAddr}`, this.ip);
                        }
                        this.memory[finalAddr] = val;

                        if (finalAddr >= this.memoryStackPointer) {
                            this.memoryStackPointer = finalAddr + 1;
                        }
                    }
                    break;
                }
                case Opcode.PRINT: {
                    const val = this.pop();
                    this.logs.push(String(val));
                    console.log(val);
                    break;
                }
                case Opcode.JMP:
                    this.ip = this.readOperand();
                    break;
                case Opcode.JMP_IF_FALSE: {
                    const target = this.readOperand();
                    const condition = this.pop();
                    if (!condition) this.ip = target;
                    break;
                }
                case Opcode.CMP_GT: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('CMP_GT requires numeric operands', this.ip);
                    }
                    this.push(a > b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_LT: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('CMP_LT requires numeric operands', this.ip);
                    }
                    this.push(a < b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_EQ: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a === b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_NEQ: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a !== b ? 1 : 0);
                    break;
                }
                case Opcode.AND: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a && b ? 1 : 0);
                    break;
                }
                case Opcode.OR: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a || b ? 1 : 0);
                    break;
                }
                case Opcode.NOT: {
                    const a = this.pop();
                    this.push(!a ? 1 : 0);
                    break;
                }
                case Opcode.CALL: {
                    const address = this.readOperand();
                    const argCount = this.readOperand();
                    
                    if (this.callStack.length >= 256) {
                        throw new RuntimeError('Call Stack Overflow', this.ip);
                    }

                    // Verify enough arguments on stack
                    if (this.stack.length < argCount) {
                        throw new RuntimeError('Stack Underflow in CALL', this.ip);
                    }

                    const args = [];
                    for(let i=0; i<argCount; i++) args.push(this.pop());
                    for(let i=argCount-1; i>=0; i--) this.push(args[i]);
                    
                    this.callStack.push({ returnAddr: this.ip, oldBp: this.bp });
                    this.bp = this.memoryStackPointer;
                    this.ip = address;
                    break;
                }
                case Opcode.RET: {
                    const frame = this.callStack.pop();
                    if (!frame) {
                        throw new RuntimeError('Top-level return', this.ip);
                    }
                    this.memoryStackPointer = this.bp; // Free the frame's memory
                    this.bp = frame.oldBp;
                    this.ip = frame.returnAddr;
                    break;
                }
                case Opcode.POP:
                    this.pop();
                    break;
                case Opcode.ARG_COUNT: {
                    this.push(this.args.length);
                    break;
                }
                case Opcode.GET_ARG: {
                    const idx = this.pop();
                    if (typeof idx !== 'number') throw new RuntimeError('GET_ARG requires numeric index', this.ip);
                    this.push(this.args[idx] ?? null);
                    break;
                }
                case Opcode.TO_NUMBER: {
                    const val = this.pop();
                    this.push(parseInt(String(val), 10));
                    break;
                }
                case Opcode.READ_FILE: {
                    const userPath = this.pop();
                    if (typeof userPath !== 'string') throw new RuntimeError('read_file requires string path', this.ip);
                    this.checkPermission('read', userPath);
                    const safePath = this.safeResolve(userPath);
                    try {
                        this.push(fs.readFileSync(safePath, 'utf-8'));
                    } catch (e) {
                        this.push(null);
                    }
                    break;
                }
                case Opcode.WRITE_FILE: {
                    const content = this.pop();
                    const userPath = this.pop();
                    if (typeof userPath !== 'string' || typeof content !== 'string') throw new RuntimeError('write_file requires string path and content', this.ip);
                    this.checkPermission('write', userPath);
                    const safePath = this.safeResolve(userPath);
                    try {
                        fs.writeFileSync(safePath, content, 'utf-8');
                        this.push(1);
                    } catch (e) {
                        this.push(0);
                    }
                    break;
                }
                case Opcode.FILE_EXISTS: {
                    const userPath = this.pop();
                    if (typeof userPath !== 'string') throw new RuntimeError('file_exists requires string path', this.ip);
                    this.checkPermission('read', userPath);
                    const safePath = this.safeResolve(userPath);
                    this.push(fs.existsSync(safePath) ? 1 : 0);
                    break;
                }
                case Opcode.STR_UPPER: {
                    const str = this.pop();
                    if (typeof str !== 'string') throw new RuntimeError('str_upper requires string', this.ip);
                    this.push(str.toUpperCase());
                    break;
                }
                case Opcode.STR_WORDS: {
                    const str = this.pop();
                    if (typeof str !== 'string') throw new RuntimeError('str_words requires string', this.ip);
                    const words = str.trim().split(/\s+/);
                    this.push(words[0] === '' ? 0 : words.length);
                    break;
                }
                case Opcode.READ_LINE: {
                    const val = readline.question('');
                    this.push(val);
                    break;
                }
                case Opcode.STR_AT: {
                    const idx = this.pop();
                    const str = this.pop();
                    if (typeof str !== 'string' || typeof idx !== 'number') {
                        throw new RuntimeError('str_at requires string and index', this.ip);
                    }
                    this.push(str[idx] ?? null);
                    break;
                }
                case Opcode.STR_LEN: {
                    const str = this.pop();
                    if (typeof str !== 'string') {
                        throw new RuntimeError('str_len requires string', this.ip);
                    }
                    this.push(str.length);
                    break;
                }
                case Opcode.RUN_CMD: {
                    const cmd = this.pop();
                    if (typeof cmd !== 'string') {
                        throw new RuntimeError('run_command requires string command', this.ip);
                    }
                    this.checkPermission('run', cmd);
                    try {
                        const output = execSync(cmd, { encoding: 'utf-8' });
                        this.push(output);
                    } catch (e) {
                        this.push(null);
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown opcode: ${opcode} at ${this.ip - 1}`);
            }
        }
    }
}
