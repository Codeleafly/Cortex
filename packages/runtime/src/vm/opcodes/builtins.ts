import { Opcode } from '@nox/shared';
import { VMState } from '../VMState.js';
import { RuntimeError } from '../RuntimeError.js';

export function executeBuiltins(opcode: Opcode, state: VMState): boolean {
    switch (opcode) {
        case Opcode.ARG_COUNT: {
            state.push(state.args.length);
            break;
        }
        case Opcode.GET_ARG: {
            const idx = state.pop();
            if (typeof idx !== 'number') throw new RuntimeError('GET_ARG requires numeric index', state.ip);
            state.push(state.args[idx] ?? null);
            break;
        }
        case Opcode.TO_NUMBER: {
            const val = state.pop();
            const num = parseInt(String(val), 10);
            if (isNaN(num)) {
                state.push(null);
            } else {
                state.checkSafeInteger(num, 'TO_NUMBER');
                state.push(num);
            }
            break;
        }
        case Opcode.STR_UPPER: {
            const str = state.pop();
            if (typeof str !== 'string') throw new RuntimeError('str_upper requires string', state.ip);
            state.push(str.toUpperCase());
            break;
        }
        case Opcode.STR_WORDS: {
            const str = state.pop();
            if (typeof str !== 'string') throw new RuntimeError('str_words requires string', state.ip);
            const words = str.trim().split(/\s+/);
            state.push(words[0] === '' ? 0 : words.length);
            break;
        }
        case Opcode.STR_AT: {
            const idx = state.pop();
            const str = state.pop();
            if (typeof str !== 'string' || typeof idx !== 'number') throw new RuntimeError('str_at requires string and index', state.ip);
            state.push(str[idx] ?? null);
            break;
        }
        case Opcode.STR_LEN: {
            const str = state.pop();
            if (typeof str !== 'string') throw new RuntimeError('str_len requires string', state.ip);
            state.push(str.length);
            break;
        }
        case Opcode.SLEEP: {
            const ms = state.pop();
            if (typeof ms !== 'number') throw new RuntimeError('sleep requires numeric milliseconds', state.ip);
            state.push(new Promise(resolve => setTimeout(resolve, ms)));
            break;
        }
        default:
            return false;
    }
    return true;
}