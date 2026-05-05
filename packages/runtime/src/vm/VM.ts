import path from 'path';
import { Opcode } from '@nox/shared';
import { RuntimeError } from './RuntimeError.js';
import { VMState, Permissions, StackValue, RangeIterator } from './VMState.js';

// Lazy load handlers (or statically import for now to keep it simple but modular)
import { executeCore } from './opcodes/core.js';
import { executeMathLogic } from './opcodes/math_logic.js';
import { executeBuiltins } from './opcodes/builtins.js';
import { executeIoSys } from './opcodes/io_sys.js';
import { executeDataAsync } from './opcodes/data_async.js';

export class VM {
    public state: VMState;

    constructor(initialPermissions?: Partial<Permissions>, interactive = false) {
        this.state = new VMState(initialPermissions, interactive);
    }

    public setPrintHandler(handler: (msg: string) => void) {
        this.state.printHandler = handler;
    }

    public addWhitelist(type: keyof Permissions, target: string) {
        this.state.whitelists[type].add(path.resolve(target)); 
    }

    public get logs() {
        return this.state.logs;
    }

    public async run(bytecode: Int32Array, stringPool: string[] = [], args: string[] = []) {
        this.state.bytecode = bytecode;
        this.state.stringPool = stringPool;
        this.state.args = args;
        this.state.ip = 0;
        this.state.bp = 0;
        this.state.memoryStackPointer = 0;
        this.state.logs = [];
        this.state.stack = [];
        this.state.callStack = [];
        this.state.instructionCount = 0;
        this.state.globals.fill(null);
        await this.execute();
    }

    public async runSnippet(bytecode: Int32Array, stringPool: string[], startIp: number, args: string[] = []) {
        this.state.bytecode = bytecode;
        this.state.stringPool = stringPool;
        this.state.args = args;
        this.state.ip = startIp;
        this.state.logs = [];
        this.state.instructionCount = 0;
        try {
            await this.execute();
        } catch (e) {
            this.state.stack = []; // Clear stack on error in REPL to prevent memory/state leaks
            throw e;
        }
    }

    private async execute() {
        while (this.state.ip < this.state.bytecode.length) {
            if (++this.state.instructionCount > this.state.MAX_INSTRUCTIONS) {
                throw new RuntimeError(`Resource Exhaustion: Maximum instruction limit reached (${this.state.MAX_INSTRUCTIONS})`, this.state.ip);
            }
            
            const opcode = this.state.bytecode[this.state.ip++] as Opcode;

            // Try modular handlers
            if (!executeCore(opcode, this.state)) {
                if (opcode === Opcode.HALT) return;
            } else continue; // Handled

            if (executeMathLogic(opcode, this.state)) continue;
            if (executeBuiltins(opcode, this.state)) continue;
            if (executeIoSys(opcode, this.state)) continue;
            if (await executeDataAsync(opcode, this.state)) continue;

            throw new Error(`Unknown opcode: ${opcode} at ${this.state.ip - 1}`);
        }
    }
}
