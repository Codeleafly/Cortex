import fs from 'fs';
import path from 'path';
import readline from 'readline-sync';
import { RuntimeError } from './RuntimeError.js';

export type StackValue = number | string | boolean | null | { [key: string]: StackValue } | RangeIterator;

export class RangeIterator {
    private current: number;
    constructor(private start: number, private end: number) {
        this.current = start;
    }
    next(): StackValue {
        if (this.current <= this.end) return this.current++;
        return null;
    }
}

export interface Permissions {
    read: boolean;
    write: boolean;
    run: boolean;
}

export class VMState {
    public stack: StackValue[] = [];
    public memory: StackValue[] = [];
    public globals: StackValue[] = [];
    public ip = 0;
    public bp = 0;
    public memoryStackPointer = 0;
    public callStack: { returnAddr: number, oldBp: number, oldSp: number }[] = [];
    public logs: string[] = [];
    public bytecode: Int32Array = new Int32Array(0);
    public stringPool: string[] = [];
    public args: string[] = [];
    public instructionCount = 0;

    public permissions: Permissions = { read: false, write: false, run: false };
    public whitelists = { read: new Set<string>(), write: new Set<string>(), run: new Set<string>() };
    public isInteractive = true;
    public printHandler: (msg: string) => void = console.log;

    public readonly MAX_INSTRUCTIONS = 1_000_000;
    public readonly MAX_STRING_LENGTH = 1_024 * 1_024;
    public readonly MAX_MEMORY_SIZE = 1_048_576;

    constructor(initialPermissions?: Partial<Permissions>, interactive = false) {
        this.memory = new Array(1024).fill(null);
        this.globals = new Array(512).fill(null);
        if (initialPermissions) {
            this.permissions = { ...this.permissions, ...initialPermissions };
        }
        this.isInteractive = interactive;
    }

    public push(val: StackValue) {
        if (this.stack.length >= 1024) throw new RuntimeError('Stack Overflow', this.ip);
        if (typeof val === 'string' && val.length > this.MAX_STRING_LENGTH) {
            throw new RuntimeError(`String length exceeds limit (${this.MAX_STRING_LENGTH})`, this.ip);
        }
        this.stack.push(val);
    }

    public pop(): StackValue {
        if (this.stack.length === 0) throw new RuntimeError('Stack Underflow', this.ip);
        return this.stack.pop()!;
    }

    public peek(): StackValue {
        if (this.stack.length === 0) throw new RuntimeError('Stack Underflow (peek)', this.ip);
        return this.stack[this.stack.length - 1];
    }

    public readOperand(): number {
        if (this.ip >= this.bytecode.length || this.ip < 0) {
            throw new RuntimeError('Unexpected end of bytecode', this.ip);
        }
        return this.bytecode[this.ip++];
    }

    public ensureMemory(addr: number) {
        if (addr < 0 || addr >= this.MAX_MEMORY_SIZE) throw new RuntimeError(`Memory Error: Address ${addr} out of bounds`, this.ip);
        if (addr >= this.memory.length) {
            const newSize = Math.min(this.MAX_MEMORY_SIZE, Math.max(this.memory.length * 2, addr + 1));
            const oldLength = this.memory.length;
            this.memory.length = newSize;
            this.memory.fill(null, oldLength);
        }
    }

    public ensureGlobals(addr: number) {
        if (addr < 0 || addr >= this.MAX_MEMORY_SIZE) throw new RuntimeError(`Memory Error: Global address ${addr} out of bounds`, this.ip);
        if (addr >= this.globals.length) {
            const newSize = Math.min(this.MAX_MEMORY_SIZE, Math.max(this.globals.length * 2, addr + 1));
            const oldLength = this.globals.length;
            this.globals.length = newSize;
            this.globals.fill(null, oldLength);
        }
    }

    public checkSafeInteger(val: number, op: string) {
        if (!Number.isSafeInteger(val)) {
            throw new RuntimeError(`Numeric Precision Error: Result of ${op} is not a safe integer (${val})`, this.ip);
        }
    }

    public safeResolve(userPath: string): string {
        const getReal = (p: string): string => {
            try { return fs.realpathSync(p); } catch {
                const parent = path.dirname(p);
                if (parent === p) return p;
                return path.join(getReal(parent), path.basename(p));
            }
        };
        const root = getReal(path.resolve(process.cwd()));
        const resolved = getReal(path.resolve(userPath));
        const rel = path.relative(root, resolved);
        const isInside = rel === "" || (!rel.startsWith('..') && !path.isAbsolute(rel));
        if (!isInside) throw new RuntimeError(`Security Error: Sandbox escape attempt: ${userPath}`, this.ip);
        return path.resolve(userPath);
    }

    public checkPermission(type: keyof Permissions, target?: string): void {
        if (this.permissions[type]) return;
        if (target) {
            const resolvedTarget = path.resolve(target);
            if (this.whitelists[type].has(resolvedTarget)) return;
        }
        if (!this.isInteractive) {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied`, this.ip);
        }
        console.warn(`\x1b[33m║\x1b[0m Nox script requesting \x1b[1m${type.toUpperCase()}\x1b[0m access${target ? ' to: ' + target : ''}`);
        const answer = readline.question(`Allow? (y/n): `);
        if (answer.toLowerCase() === 'y') {
            if (target) this.whitelists[type].add(path.resolve(target));
            else this.permissions[type] = true;
        } else {
            throw new RuntimeError(`Security Error: ${type.toUpperCase()} permission denied by user.`, this.ip);
        }
    }
}