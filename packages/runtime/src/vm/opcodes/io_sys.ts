import fs from 'fs';
import readline from 'readline-sync';
import { spawnSync } from 'child_process';
import { Opcode } from '@nox/shared';
import { VMState } from '../VMState.js';
import { RuntimeError } from '../RuntimeError.js';

export function executeIoSys(opcode: Opcode, state: VMState): boolean {
    switch (opcode) {
        case Opcode.PRINT: {
            const val = state.pop();
            const msg = String(val);
            state.logs.push(msg);
            state.printHandler(msg);
            break;
        }
        case Opcode.READ_LINE: {
            if (!state.isInteractive) throw new RuntimeError('Security Error: READ_LINE denied (Non-interactive mode)', state.ip);
            const val = readline.question('');
            state.push(val);
            break;
        }
        case Opcode.READ_FILE: {
            const userPath = state.pop();
            if (typeof userPath !== 'string') throw new RuntimeError('read_file requires string path', state.ip);
            state.checkPermission('read', userPath);
            const safePath = state.safeResolve(userPath);
            try {
                state.push(fs.readFileSync(safePath, 'utf-8'));
            } catch (e) {
                state.push(null);
            }
            break;
        }
        case Opcode.WRITE_FILE: {
            const content = state.pop();
            const userPath = state.pop();
            if (typeof userPath !== 'string' || typeof content !== 'string') throw new RuntimeError('write_file requires string path and content', state.ip);
            state.checkPermission('write', userPath);
            const safePath = state.safeResolve(userPath);
            try {
                fs.writeFileSync(safePath, content, 'utf-8');
                state.push(1);
            } catch (e) {
                state.push(0);
            }
            break;
        }
        case Opcode.FILE_EXISTS: {
            const userPath = state.pop();
            if (typeof userPath !== 'string') throw new RuntimeError('file_exists requires string path', state.ip);
            state.checkPermission('read', userPath);
            const safePath = state.safeResolve(userPath);
            state.push(fs.existsSync(safePath) ? 1 : 0);
            break;
        }
        case Opcode.RUN_CMD: {
            const cmd = state.pop();
            if (typeof cmd !== 'string') throw new RuntimeError('run_command requires string command', state.ip);
            if (/[;&|`$\n\r><()\{}*?\[\]!#~\\]/.test(cmd)) {
                throw new RuntimeError('Security Error: Shell metacharacters are not allowed to prevent injection.', state.ip);
            }
            const parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g);
            if (!parts || parts.length === 0) {
                state.push("");
                break;
            }
            const executable = parts[0].replace(/^"|"$/g, '');
            const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));
            state.checkPermission('run', executable);
            try {
                const result = spawnSync(executable, args, { encoding: 'utf-8', shell: false, timeout: 10000 });
                if (result.error) {
                    state.push(null);
                } else {
                    state.push(result.stdout || result.stderr || "");
                }
            } catch (e) {
                state.push(null);
            }
            break;
        }
        default:
            return false;
    }
    return true;
}