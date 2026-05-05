
import { describe, it, expect } from 'vitest';
import { VM } from '../../packages/runtime/src/vm/VM';
import { Opcode } from '@nox/shared';

describe('VULN-09: Non-Interactive READ_LINE Hang', () => {
    it('should throw error on READ_LINE in non-interactive mode', async () => {
        const vm = new VM({}, false); // interactive = false
        const bytecode = new Int32Array([Opcode.READ_LINE, Opcode.HALT]);
        
        await expect(vm.run(bytecode)).rejects.toThrow('READ_LINE denied (Non-interactive mode)');
    });
});
