import { describe, test, expect, beforeEach } from 'vitest';
import { VM } from '../src/vm/VM';
import { Opcode } from '@cortex/shared';

describe('VM Vulnerabilities', () => {
    let vm: VM;

    beforeEach(() => {
        vm = new VM();
    });

    test('VULN-VM-01: Unbounded Memory Access (LOAD)', () => {
        const bytecode = new Int32Array([
            Opcode.LOAD, 2000, // Address beyond 1024
            Opcode.HALT
        ]);
        // Currently it might just return undefined and not crash Node, but it's undefined behavior in the VM
        expect(() => vm.run(bytecode)).toThrow(); 
    });

    test('VULN-VM-01: Unbounded Memory Access (STORE)', () => {
        const bytecode = new Int32Array([
            Opcode.PUSH, 42,
            Opcode.STORE, 2000, // Address beyond 1024
            Opcode.HALT
        ]);
        expect(() => vm.run(bytecode)).toThrow();
    });

    test('VULN-VM-03: Stack Underflow', () => {
        const bytecode = new Int32Array([
            Opcode.ADD, // Pop from empty stack
            Opcode.HALT
        ]);
        expect(() => vm.run(bytecode)).toThrow();
    });

    test('VULN-VM-04: Top-Level Return Crash', () => {
        const bytecode = new Int32Array([
            Opcode.RET,
            Opcode.HALT
        ]);
        expect(() => vm.run(bytecode)).toThrow();
    });

    test('VULN-COMP-01: Recursion (Factorial)', () => {
        // [0] JMP 27
        // [2] fact start:
        // [2] STORE 0 (n)
        // [4] LOAD 0 (n)
        // [6] PUSH 0
        // [8] CMP_EQ
        // [9] JMP_IF_FALSE 15
        // [11] PUSH 1
        // [13] RET
        // [14] HALT
        // [15] LOAD 0 (n)
        // [17] LOAD 0 (n)
        // [19] PUSH 1
        // [21] SUB
        // [22] CALL 2, 1
        // [25] MUL
        // [26] RET
        // [27] main:
        // [27] PUSH 5
        // [29] CALL 2, 1
        // [32] PRINT
        // [33] HALT
        
        const bytecode = new Int32Array([
            Opcode.JMP, 27,
            Opcode.STORE, 0,
            Opcode.LOAD, 0,
            Opcode.PUSH, 0,
            Opcode.CMP_EQ,
            Opcode.JMP_IF_FALSE, 15,
            Opcode.PUSH, 1,
            Opcode.RET,
            Opcode.HALT,
            Opcode.LOAD, 0,
            Opcode.LOAD, 0,
            Opcode.PUSH, 1,
            Opcode.SUB,
            Opcode.CALL, 2, 1,
            Opcode.MUL,
            Opcode.RET,
            Opcode.PUSH, 5,
            Opcode.CALL, 2, 1,
            Opcode.PRINT,
            Opcode.HALT
        ]);

        vm.run(bytecode);
        expect(vm.logs).toEqual(['120']);
    });

    test('VULN-VM-DoS-01: Call Stack Overflow', () => {
        // [0] CALL 0, 0
        const bytecode = new Int32Array([
            Opcode.CALL, 0, 0,
            Opcode.HALT
        ]);
        expect(() => vm.run(bytecode)).toThrow('Call Stack Overflow');
    });

    test('VULN-VM-DATA-01: Truncated Bytecode', () => {
        const bytecode = new Int32Array([
            Opcode.PUSH // Missing operand
        ]);
        expect(() => vm.run(bytecode)).toThrow('Unexpected end of bytecode: missing operand');
    });

    test('VULN-VM-LOGIC-01: Global Memory Pointer Isolation', () => {
        // Corrected Indices:
        // [0] JMP 9
        // [2] test start:
        // [2] STORE 0 (y)
        // [4] LOAD 0 (y)
        // [6] PRINT
        // [7] RET
        // [8] HALT
        // [9] PUSH 100
        // [11] STORE -1 (global x)
        // [13] PUSH 200
        // [15] CALL 2, 0
        // [18] HALT
        
        const bytecode = new Int32Array([
            Opcode.JMP, 9,
            Opcode.STORE, 0,
            Opcode.LOAD, 0,
            Opcode.PRINT,
            Opcode.RET,
            Opcode.HALT,
            Opcode.PUSH, 100,
            Opcode.STORE, -1, // Global 0 (~0)
            Opcode.PUSH, 200,
            Opcode.CALL, 2, 0,
            Opcode.HALT
        ]);

        vm.run(bytecode);
        expect(vm.logs).toEqual(['200']);

        // Now test high global
        // [0] JMP 9
        // [2] test: STORE 0, LOAD 0, PRINT, RET, HALT
        // [9] PUSH 100, STORE ~500, PUSH 200, CALL 2, 0, HALT
        const bytecodeHigh = new Int32Array([
            Opcode.JMP, 9,
            Opcode.STORE, 0,
            Opcode.LOAD, 0,
            Opcode.PRINT,
            Opcode.RET,
            Opcode.HALT,
            Opcode.PUSH, 100,
            Opcode.STORE, ~500, // Global 500
            Opcode.PUSH, 200,
            Opcode.CALL, 2, 0,
            Opcode.HALT
        ]);
        vm.run(bytecodeHigh);
        expect(vm.logs).toEqual(['200']);
    });
});
