import { describe, test, expect, beforeEach } from 'vitest';
import { VM } from '@cortex/runtime';
import { Opcode } from '@cortex/shared';

describe('Phase 3 Critical Bugs', () => {
    let vm: VM;

    beforeEach(() => {
        vm = new VM();
    });

    test('VULN-CTX-01: Global/Local Memory Collision', () => {
        const bytecode = new Int32Array([
            Opcode.JMP, 8,
            Opcode.PUSH, 20, // [2] test start
            Opcode.STORE, 0, // [4] y = 20
            Opcode.RET,      // [6]
            Opcode.HALT,     // [7]
            Opcode.PUSH, 10, // [8] main start
            Opcode.STORE, -1, // [10] x = 10 (Global 0)
            Opcode.CALL, 2, 0, // [12] call test
            Opcode.LOAD, -1, // [15] load Global 0
            Opcode.PRINT,    // [17]
            Opcode.HALT      // [18]
        ]);

        vm.run(bytecode);
        // Collision: x is global 0 (index 0).
        // STORE -1 (x=10) writes to index 0.
        // memoryStackPointer is not updated for globals. So it remains 0.
        // CALL sets bp = memoryStackPointer = 0.
        // test: STORE 0 (y=20) writes to bp + 0 = 0.
        // Global 0 is overwritten! Logs will have '20' instead of '10'.
        expect(vm.logs).toEqual(['10']);
    });

    test('VULN-CTX-02: Function Statement Stack Desynchronization', () => {
        // [0] JMP 7
        // [2] test start:
        // [2] PUSH 1
        // [4] PRINT
        // [5] PUSH 0 (null) - ADDED BY COMPILER
        // [7] RET
        // [8] main start:
        // [8] CALL 2, 0
        // [11] POP
        // [12] HALT
        
        const bytecode = new Int32Array([
            Opcode.JMP, 8,
            Opcode.PUSH, 1,  // [2]
            Opcode.PRINT,    // [4]
            Opcode.PUSH, 0,  // [5] return null
            Opcode.RET,      // [7]
            Opcode.CALL, 2, 0, // [8]
            Opcode.POP,      // [11]
            Opcode.HALT
        ]);

        vm.run(bytecode);
        expect(vm.logs).toEqual(['1']);
    });
});
