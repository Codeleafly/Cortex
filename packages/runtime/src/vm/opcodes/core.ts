import { Opcode } from '@nox/shared';
import { VMState, RangeIterator, StackValue } from '../VMState.js';
import { RuntimeError } from '../RuntimeError.js';

export function executeCore(opcode: Opcode, state: VMState): boolean {
    switch (opcode) {
        case Opcode.HALT:
            return false; // stop execution
        case Opcode.DUP:
            state.push(state.peek());
            break;
        case Opcode.PUSH:
            state.push(state.readOperand());
            break;
        case Opcode.PUSH_STR: {
            const idx = state.readOperand();
            if (idx < 0 || idx >= state.stringPool.length) throw new RuntimeError(`Invalid string pool index`, state.ip);
            state.push(state.stringPool[idx]);
            break;
        }
        case Opcode.POP:
            state.pop();
            break;
        case Opcode.LOAD: {
            const addr = state.readOperand();
            if (addr < 0) {
                const finalAddr = ~addr;
                state.ensureGlobals(finalAddr);
                state.push(state.globals[finalAddr]);
            } else {
                const finalAddr = state.bp + addr;
                state.ensureMemory(finalAddr);
                state.push(state.memory[finalAddr]);
            }
            break;
        }
        case Opcode.STORE: {
            const addr = state.readOperand();
            const val = state.pop();
            if (addr < 0) {
                const finalAddr = ~addr;
                state.ensureGlobals(finalAddr);
                state.globals[finalAddr] = val;
            } else {
                const finalAddr = state.bp + addr;
                state.ensureMemory(finalAddr);
                state.memory[finalAddr] = val;
                if (finalAddr >= state.memoryStackPointer) state.memoryStackPointer = finalAddr + 1;
            }
            break;
        }
        case Opcode.JMP: {
            const target = state.readOperand();
            if (target < 0 || target >= state.bytecode.length) throw new RuntimeError(`Invalid jump target`, state.ip);
            state.ip = target;
            break;
        }
        case Opcode.JMP_IF_FALSE: {
            const target = state.readOperand();
            if (target < 0 || target >= state.bytecode.length) throw new RuntimeError(`Invalid jump target`, state.ip);
            const condition = state.pop();
            if (!condition) state.ip = target;
            break;
        }
        case Opcode.JMP_IF_TRUE: {
            const target = state.readOperand();
            if (target < 0 || target >= state.bytecode.length) throw new RuntimeError(`Invalid jump target`, state.ip);
            const condition = state.pop();
            if (condition) state.ip = target;
            break;
        }
        case Opcode.CALL: {
            const address = state.readOperand();
            const argCount = state.readOperand();
            if (state.callStack.length >= 256) throw new RuntimeError('Call Stack Overflow', state.ip);
            if (state.stack.length < argCount) throw new RuntimeError('Stack Underflow in CALL', state.ip);
            const args = [];
            for (let i = 0; i < argCount; i++) args.push(state.pop());
            for (let i = argCount - 1; i >= 0; i--) state.push(args[i]);
            state.callStack.push({ returnAddr: state.ip, oldBp: state.bp });
            state.bp = state.memoryStackPointer;
            state.ip = address;
            break;
        }
        case Opcode.RET: {
            const frame = state.callStack.pop();
            if (!frame) throw new RuntimeError('Top-level return', state.ip);
            state.memoryStackPointer = state.bp;
            state.bp = frame.oldBp;
            state.ip = frame.returnAddr;
            break;
        }
        default:
            return false; // Unhandled
    }
    return true; // Handled
}