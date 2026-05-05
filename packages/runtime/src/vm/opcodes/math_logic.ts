import { Opcode } from '@nox/shared';
import { VMState } from '../VMState.js';
import { RuntimeError } from '../RuntimeError.js';

export function executeMathLogic(opcode: Opcode, state: VMState): boolean {
    switch (opcode) {
        case Opcode.ADD: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a === 'number' && typeof b === 'number') {
                const res = a + b;
                state.checkSafeInteger(res, 'ADD');
                state.push(res);
            } else if (typeof a === 'string' || typeof b === 'string') {
                state.push(String(a) + String(b));
            } else {
                throw new RuntimeError(`Invalid types for ADD: ${typeof a} and ${typeof b}`, state.ip);
            }
            break;
        }
        case Opcode.SUB: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('SUB requires numeric operands', state.ip);
            const res = a - b;
            state.checkSafeInteger(res, 'SUB');
            state.push(res);
            break;
        }
        case Opcode.MUL: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('MUL requires numeric operands', state.ip);
            const res = a * b;
            state.checkSafeInteger(res, 'MUL');
            state.push(res);
            break;
        }
        case Opcode.DIV: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('DIV requires numeric operands', state.ip);
            if (b === 0) throw new RuntimeError('Division by zero', state.ip);
            const res = Math.floor(a / b);
            state.checkSafeInteger(res, 'DIV');
            state.push(res);
            break;
        }
        case Opcode.CMP_GT: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('CMP_GT requires numeric operands', state.ip);
            state.push(a > b ? 1 : 0);
            break;
        }
        case Opcode.CMP_LT: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('CMP_LT requires numeric operands', state.ip);
            state.push(a < b ? 1 : 0);
            break;
        }
        case Opcode.CMP_GE: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('CMP_GE requires numeric operands', state.ip);
            state.push(a >= b ? 1 : 0);
            break;
        }
        case Opcode.CMP_LE: {
            const b = state.pop();
            const a = state.pop();
            if (typeof a !== 'number' || typeof b !== 'number') throw new RuntimeError('CMP_LE requires numeric operands', state.ip);
            state.push(a <= b ? 1 : 0);
            break;
        }
        case Opcode.CMP_EQ: {
            const b = state.pop();
            const a = state.pop();
            state.push(a === b ? 1 : 0);
            break;
        }
        case Opcode.CMP_NEQ: {
            const b = state.pop();
            const a = state.pop();
            state.push(a !== b ? 1 : 0);
            break;
        }
        case Opcode.AND: {
            const b = state.pop();
            const a = state.pop();
            state.push(a && b);
            break;
        }
        case Opcode.OR: {
            const b = state.pop();
            const a = state.pop();
            state.push(a || b);
            break;
        }
        case Opcode.NOT: {
            const a = state.pop();
            state.push(!a ? 1 : 0);
            break;
        }
        default:
            return false; // Unhandled in this module
    }
    return true; // Handled
}