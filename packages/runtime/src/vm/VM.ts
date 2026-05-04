import { Opcode } from '@nox/shared';
import { RuntimeError } from './RuntimeError.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline-sync';
import { execSync, spawnSync } from 'child_process';

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
    private memory: StackValue[] = []; 
    private globals: StackValue[] = []; 
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
    private whitelists = {
        read: new Set<string>(),
        write: new Set<string>(),
        run: new Set<string>()
    };
    private isInteractive = true;
    private printHandler: (msg: string) => void = console.log;
    private instructionCount = 0;
    private readonly MAX_INSTRUCTIONS = 1_000_000;
    private readonly MAX_STRING_LENGTH = 1_024 * 1_024; // 1MB
    private readonly MAX_MEMORY_SIZE = 1_048_576; // 1M slots

    constructor(initialPermissions?: Partial<Permissions>, interactive = false) {
        // Initialize memory with a reasonable default size, it grows dynamically
        this.memory = new Array(1024).fill(null);
        this.globals = new Array(512).fill(null);

        if (initialPermissions) {
            this.permissions = { ...this.permissions, ...initialPermissions };
        }
        this.isInteractive = interactive;
    }

    public setPrintHandler(handler: (msg: string) => void) {
        this.printHandler = handler;
    }

    public addWhitelist(type: keyof Permissions, target: string) {
        this.whitelists[type].add(path.resolve(target));
    }

    private checkPermission(type: keyof Permissions, target?: string): void {
        if (this.permissions[type]) return;

        if (target) {
            const resolvedTarget = path.resolve(target);
            if (this.whitelists[type].has(resolvedTarget)) return;
        }

        if (!this.isInteractive) {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied (Non-interactive mode: target=${target || 'unknown'})`, this.ip);
        }

        console.warn(`\x1b[33m╔════ Security Alert ════════════════════════════════════════════════════╗\x1b[0m`);
        console.warn(`\x1b[33m║\x1b[0m Nox script is requesting \x1b[1m${type.toUpperCase()}\x1b[0m access${target ? ' to: ' + target : ''}`);
        console.warn(`\x1b[33m╚════════════════════════════════════════════════════════════════════════╝\x1b[0m`);
        
        const answer = readline.question(`Allow this operation? (y/n): `);
        if (answer.toLowerCase() === 'y') {
            if (target) {
                this.whitelists[type].add(path.resolve(target));
            } else {
                this.permissions[type] = true;
            }
            console.log(`\x1b[32mPermission granted.\x1b[0m`);
        } else {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied by user.`, this.ip);
        }
    }

    private ensureMemory(addr: number) {
        if (addr < 0 || addr >= this.MAX_MEMORY_SIZE) {
            throw new RuntimeError(`Memory Error: Address ${addr} out of bounds (max ${this.MAX_MEMORY_SIZE})`, this.ip);
        }
        if (addr >= this.memory.length) {
            const newSize = Math.min(this.MAX_MEMORY_SIZE, Math.max(this.memory.length * 2, addr + 1));
            const oldLength = this.memory.length;
            this.memory.length = newSize;
            this.memory.fill(null, oldLength);
        }
    }

    private ensureGlobals(addr: number) {
        if (addr < 0 || addr >= this.MAX_MEMORY_SIZE) {
            throw new RuntimeError(`Memory Error: Global address ${addr} out of bounds (max ${this.MAX_MEMORY_SIZE})`, this.ip);
        }
        if (addr >= this.globals.length) {
            const newSize = Math.min(this.MAX_MEMORY_SIZE, Math.max(this.globals.length * 2, addr + 1));
            const oldLength = this.globals.length;
            this.globals.length = newSize;
            this.globals.fill(null, oldLength);
        }
    }

    private readOperand(): number {
        if (this.ip >= this.bytecode.length || this.ip < 0) {
            throw new RuntimeError('Unexpected end of bytecode: missing or invalid operand', this.ip);
        }
        return this.bytecode[this.ip++];
    }

    private push(val: StackValue) {
        if (this.stack.length >= 1024) {
            throw new RuntimeError('Stack Overflow', this.ip);
        }
        if (typeof val === 'string' && val.length > this.MAX_STRING_LENGTH) {
            throw new RuntimeError(`Resource Exhaustion: String length exceeds limit (${this.MAX_STRING_LENGTH})`, this.ip);
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

    private checkSafeInteger(val: number, op: string) {
        if (!Number.isSafeInteger(val)) {
            throw new RuntimeError(`Numeric Precision Error: Result of ${op} is not a safe integer (${val})`, this.ip);
        }
    }

    private safeResolve(userPath: string): string {
        const getReal = (p: string): string => {
            try {
                return fs.realpathSync(p);
            } catch {
                const parent = path.dirname(p);
                if (parent === p) return p;
                return path.join(getReal(parent), path.basename(p));
            }
        };

        const root = getReal(path.resolve(process.cwd()));
        const resolved = getReal(path.resolve(userPath));

        const rel = path.relative(root, resolved);
        const isInside = rel === "" || (!rel.startsWith('..') && !path.isAbsolute(rel));

        if (!isInside) {
            throw new RuntimeError(`Security Error: Sandbox escape attempt for path: ${userPath}`, this.ip);
        }

        return path.resolve(userPath);
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
        this.instructionCount = 0;
        this.globals.fill(null);
        this.execute();
    }

    public runSnippet(bytecode: Int32Array, stringPool: string[], startIp: number, args: string[] = []) {
        this.bytecode = bytecode;
        this.stringPool = stringPool;
        this.args = args;
        this.ip = startIp;
        this.logs = [];
        this.instructionCount = 0;
        try {
            this.execute();
        } catch (e) {
            this.stack = []; // Clear stack on error in REPL to prevent memory/state leaks
            throw e;
        }
    }

    private execute() {
        while (this.ip < this.bytecode.length) {
            if (++this.instructionCount > this.MAX_INSTRUCTIONS) {
                throw new RuntimeError(`Resource Exhaustion: Maximum instruction limit reached (${this.MAX_INSTRUCTIONS})`, this.ip);
            }
            
            const opcode = this.bytecode[this.ip++] as Opcode;

            switch (opcode) {
                case Opcode.HALT:
                    return;
                case Opcode.DUP:
                    this.push(this.peek());
                    break;
                case Opcode.PUSH:
                    this.push(this.readOperand());
                    break;
                case Opcode.PUSH_STR: {
                    const idx = this.readOperand();
                    if (idx < 0 || idx >= this.stringPool.length) {
                        throw new RuntimeError(`Invalid string pool index: ${idx}`, this.ip);
                    }
                    this.push(this.stringPool[idx]);
                    break;
                }
                case Opcode.ADD: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a === 'number' && typeof b === 'number') {
                        const res = a + b;
                        this.checkSafeInteger(res, 'ADD');
                        this.push(res);
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
                    const res = a - b;
                    this.checkSafeInteger(res, 'SUB');
                    this.push(res);
                    break;
                }
                case Opcode.MUL: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('MUL requires numeric operands', this.ip);
                    }
                    const res = a * b;
                    this.checkSafeInteger(res, 'MUL');
                    this.push(res);
                    break;
                }
                case Opcode.DIV: {
                    const b = this.pop();
                    const a = this.pop();
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new RuntimeError('DIV requires numeric operands', this.ip);
                    }
                    if (b === 0) throw new RuntimeError('Division by zero', this.ip);
                    const res = Math.floor(a / b);
                    this.checkSafeInteger(res, 'DIV');
                    this.push(res);
                    break;
                }
                case Opcode.LOAD: {
                    const addr = this.readOperand();
                    if (addr < 0) {
                        const finalAddr = ~addr;
                        this.ensureGlobals(finalAddr);
                        this.push(this.globals[finalAddr]);
                    } else {
                        const finalAddr = this.bp + addr;
                        this.ensureMemory(finalAddr);
                        this.push(this.memory[finalAddr]);
                    }
                    break;
                }
                case Opcode.STORE: {
                    const addr = this.readOperand();
                    const val = this.pop();
                    if (addr < 0) {
                        const finalAddr = ~addr;
                        this.ensureGlobals(finalAddr);
                        this.globals[finalAddr] = val;
                    } else {
                        const finalAddr = this.bp + addr;
                        this.ensureMemory(finalAddr);
                        this.memory[finalAddr] = val;

                        if (finalAddr >= this.memoryStackPointer) {
                            this.memoryStackPointer = finalAddr + 1;
                        }
                    }
                    break;
                }
                case Opcode.PRINT: {
                    const val = this.pop();
                    const msg = String(val);
                    this.logs.push(msg);
                    this.printHandler(msg);
                    break;
                }
                case Opcode.JMP: {
                    const target = this.readOperand();
                    if (target < 0 || target >= this.bytecode.length) {
                        throw new RuntimeError(`Invalid jump target: ${target}`, this.ip);
                    }
                    this.ip = target;
                    break;
                }
                case Opcode.JMP_IF_FALSE: {
                    const target = this.readOperand();
                    if (target < 0 || target >= this.bytecode.length) {
                        throw new RuntimeError(`Invalid jump target: ${target}`, this.ip);
                    }
                    const condition = this.pop();
                    if (!condition) this.ip = target;
                    break;
                }
                case Opcode.JMP_IF_TRUE: {
                    const target = this.readOperand();
                    if (target < 0 || target >= this.bytecode.length) {
                        throw new RuntimeError(`Invalid jump target: ${target}`, this.ip);
                    }
                    const condition = this.pop();
                    if (condition) this.ip = target;
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
                    this.push(a && b);
                    break;
                }
                case Opcode.OR: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a || b);
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
                    const num = parseInt(String(val), 10);
                    if (isNaN(num)) {
                         this.push(null);
                    } else {
                        this.checkSafeInteger(num, 'TO_NUMBER');
                        this.push(num);
                    }
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
                    if (!this.isInteractive) {
                        throw new RuntimeError('Security Error: READ_LINE denied (Non-interactive mode)', this.ip);
                    }
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

                    // Strict hardening against shell injection
                    // Blacklist: ; & | ` $ \n \r > < ( ) { } * ? [ ] ! # ~ \
                    if (/[;&|`$\n\r><()\{}*?\[\]!#~\\]/.test(cmd)) {
                        throw new RuntimeError('Security Error: Shell metacharacters, newlines, or redirection are not allowed in run_command to prevent injection.', this.ip);
                    }

                    // Extract executable for permission check
                    const parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g);
                    if (!parts || parts.length === 0) {
                        this.push("");
                        break;
                    }
                    const executable = parts[0].replace(/^"|"$/g, '');
                    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

                    this.checkPermission('run', executable);
                    try {
                        // Use spawnSync with shell: false for maximum safety.
                        const result = spawnSync(executable, args, { 
                            encoding: 'utf-8', 
                            shell: false,
                            timeout: 10000 // 10 second timeout
                        });

                        if (result.error) {
                             this.push(null);
                        } else {
                             this.push(result.stdout || result.stderr || "");
                        }
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
