import { Opcode } from '@cortex/shared';
import { RuntimeError } from './RuntimeError.js';

type StackValue = number | string | boolean | null;

/**
 * Virtual Machine: Executes the numeric bytecode.
 */
export class VM {
    private stack: StackValue[] = []; 
    private memory: StackValue[] = new Array(1024).fill(0); 
    private ip = 0; 
    private bp = 0; 
    private memoryStackPointer = 0; 
    private callStack: { returnAddr: number, oldBp: number }[] = []; 
    public logs: string[] = [];
    
    private bytecode: Int32Array = new Int32Array(0);
    private stringPool: string[] = [];
    private args: string[] = [];

    constructor() {}

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
                    let finalAddr: number;
                    if (addr < 0) {
                        finalAddr = ~addr; // Global (absolute)
                    } else {
                        finalAddr = this.bp + addr; // Local (relative)
                    }

                    if (finalAddr < 0 || finalAddr >= this.memory.length) {
                        throw new RuntimeError(`Invalid memory address: ${finalAddr} (raw: ${addr}, bp: ${this.bp})`, this.ip);
                    }
                    this.push(this.memory[finalAddr]);
                    break;
                }
                case Opcode.STORE: {
                    const addr = this.readOperand();
                    let finalAddr: number;
                    if (addr < 0) {
                        finalAddr = ~addr; // Global (absolute)
                    } else {
                        finalAddr = this.bp + addr; // Local (relative)
                    }

                    if (finalAddr < 0 || finalAddr >= this.memory.length) {
                        throw new RuntimeError(`Invalid memory address: ${finalAddr}`, this.ip);
                    }
                    const val = this.pop();
                    this.memory[finalAddr] = val;

                    // Update memory stack pointer if we stored a local or top-level var
                    // Globals (addr < 0) should not update the memoryStackPointer
                    if (addr >= 0 && finalAddr >= this.memoryStackPointer) {
                        this.memoryStackPointer = finalAddr + 1;
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
                default:
                    throw new Error(`Unknown opcode: ${opcode} at ${this.ip - 1}`);
            }
        }
    }
}
