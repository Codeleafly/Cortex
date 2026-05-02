import { Opcode } from '@cortex/shared';

/**
 * Virtual Machine: Executes the numeric bytecode.
 */
export class VM {
    private stack: (number | string | boolean | null)[] = []; 
    private memory = new Array(1024).fill(0); 
    private ip = 0; 
    private callStack: number[] = []; // Stack for return addresses
    public logs: string[] = [];
    
    private bytecode: Int32Array = new Int32Array(0);
    private stringPool: string[] = [];
    private args: string[] = [];

    constructor() {}

    public run(bytecode: Int32Array, stringPool: string[] = [], args: string[] = []) {
        this.bytecode = bytecode;
        this.stringPool = stringPool;
        this.args = args;
        this.ip = 0;
        this.logs = [];
        this.execute();
    }

    public runSnippet(bytecode: Int32Array, stringPool: string[], startIp: number, args: string[] = []) {
        this.bytecode = bytecode;
        this.stringPool = stringPool;
        this.args = args;
        this.ip = startIp;
        this.logs = [];
        this.execute();
    }

    private execute() {
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
                    const b = this.stack.pop() as any;
                    const a = this.stack.pop() as any;
                    this.stack.push(a + b);
                    break;
                }
                case Opcode.SUB: {
                    const b = this.stack.pop() as number;
                    const a = this.stack.pop() as number;
                    this.stack.push(a - b);
                    break;
                }
                case Opcode.MUL: {
                    const b = this.stack.pop() as number;
                    const a = this.stack.pop() as number;
                    this.stack.push(a * b);
                    break;
                }
                case Opcode.DIV: {
                    const b = this.stack.pop() as number;
                    const a = this.stack.pop() as number;
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
                    const val = this.stack.pop() as any;
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
                    const b = this.stack.pop() as number;
                    const a = this.stack.pop() as number;
                    this.stack.push(a > b ? 1 : 0);
                    break;
                }
                case Opcode.CMP_LT: {
                    const b = this.stack.pop() as number;
                    const a = this.stack.pop() as number;
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
                    
                    const args = [];
                    for(let i=0; i<argCount; i++) args.push(this.stack.pop());
                    for(let i=argCount-1; i>=0; i--) this.stack.push(args[i] as (number | string | boolean | null));
                    
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
                case Opcode.ARG_COUNT: {
                    this.stack.push(this.args.length);
                    break;
                }
                case Opcode.GET_ARG: {
                    const idx = this.stack.pop() as number;
                    this.stack.push(this.args[idx] ?? null);
                    break;
                }
                case Opcode.TO_NUMBER: {
                    const val = this.stack.pop() as string;
                    this.stack.push(parseInt(val, 10));
                    break;
                }
                default:
                    throw new Error(`Unknown opcode: ${opcode} at ${this.ip - 1}`);
            }
        }
    }
}
