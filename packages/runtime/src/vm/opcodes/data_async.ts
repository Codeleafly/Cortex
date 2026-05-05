import { Opcode } from '@nox/shared';
import { VMState, RangeIterator, StackValue } from '../VMState.js';
import { RuntimeError } from '../RuntimeError.js';

export async function executeDataAsync(opcode: Opcode, state: VMState): Promise<boolean> {
    switch (opcode) {
        case Opcode.DICT_BUILD: {
            const count = state.readOperand();
            const dict: { [key: string]: StackValue } = {};
            for (let i = 0; i < count; i++) {
                const value = state.pop();
                const key = state.pop();
                if (typeof key !== 'string') throw new RuntimeError('Dictionary key must be a string', state.ip);
                dict[key] = value;
            }
            state.push(dict);
            break;
        }
        case Opcode.DICT_GET: {
            const key = state.pop();
            const dict = state.pop();
            if (typeof key !== 'string') throw new RuntimeError('Dictionary key must be a string', state.ip);
            if (dict === null) {
                state.push(null);
            } else if (typeof dict === 'object' && !(dict instanceof RangeIterator)) {
                state.push((dict as any)[key] ?? null);
            } else {
                state.push(null);
            }
            break;
        }
        case Opcode.DICT_SET: {
            const value = state.pop();
            const key = state.pop();
            const dict = state.pop();
            if (typeof key !== 'string') throw new RuntimeError('Dictionary key must be a string', state.ip);
            if (typeof dict === 'object' && dict !== null && !(dict instanceof RangeIterator)) {
                (dict as any)[key] = value;
            } else {
                throw new RuntimeError('DICT_SET requires a dictionary object', state.ip);
            }
            break;
        }
        case Opcode.ITER_NEXT: {
            const target = state.readOperand();
            const iter = state.peek();
            if (iter instanceof RangeIterator) {
                const next = iter.next();
                if (next === null) {
                    state.pop();
                    state.ip = target;
                } else {
                    state.push(next);
                }
            } else {
                state.pop(); // Pop the non-iterable to prevent leak before throwing
                throw new RuntimeError(`Type Error: Value of type ${typeof iter} is not iterable`, state.ip);
            }
            break;
        }
        case Opcode.RANGE: {
            const end = state.pop();
            const start = state.pop();
            if (typeof start !== 'number' || typeof end !== 'number') throw new RuntimeError('Range requires numeric bounds', state.ip);
            state.push(new RangeIterator(start, end));
            break;
        }
        case Opcode.AWAIT: {
            const promise = state.pop();
            if (promise instanceof Promise) {
                state.push((await promise) as StackValue);
            } else {
                state.push(promise);
            }
            break;
        }
        default:
            return false;
    }
    return true;
}