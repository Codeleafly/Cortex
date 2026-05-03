import { describe, it, expect, vi } from 'vitest';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { VM } from '../../packages/runtime/src/vm/VM';
import { Opcode } from '@cortex/shared';
import fs from 'fs';
import path from 'path';

describe('Cyber Audit Vulnerabilities', () => {

    describe('VULN-CYBER-01: Logical Operators Value Retention', () => {
        it('should return the original truthy value for ||', () => {
            const source = `
                let x = "hello" || 0;
                print x;
            `;
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            const compiler = new Compiler();
            const { bytecode, stringPool } = compiler.compile(statements);
            const vm = new VM();
            
            vm.run(bytecode, stringPool);
            
            expect(vm.logs[0]).toBe("hello");
        });

        it('should return the original truthy value for &&', () => {
            const source = `
                let x = 1 && "world";
                print x;
            `;
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            const compiler = new Compiler();
            const { bytecode, stringPool } = compiler.compile(statements);
            const vm = new VM();
            
            vm.run(bytecode, stringPool);
            
            expect(vm.logs[0]).toBe("world");
        });
        
        it('should short-circuit and return the first falsey value for &&', () => {
             const source = `
                let x = 0 && "world";
                print x;
            `;
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            const compiler = new Compiler();
            const { bytecode, stringPool } = compiler.compile(statements);
            const vm = new VM();
            
            vm.run(bytecode, stringPool);
            
            expect(vm.logs[0]).toBe("0"); 
        });
    });

    describe('VULN-CYBER-02: Permission Granularity (CLI & VM)', () => {
        it('should respect path-specific whitelists for READ_FILE', () => {
            const vm = new VM({}, false); 
            
            // Manually add to whitelist
            vm.addWhitelist('read', 'allowed.txt');
            
            fs.writeFileSync('allowed.txt', 'secret content');
            fs.writeFileSync('forbidden.txt', 'you should not see this');
            
            try {
                vm.run(new Int32Array([
                    Opcode.PUSH_STR, 0,
                    Opcode.READ_FILE,
                    Opcode.PRINT,
                    Opcode.HALT
                ]), ['allowed.txt']);
                expect(vm.logs).toContain('secret content');

                expect(() => {
                    vm.run(new Int32Array([
                        Opcode.PUSH_STR, 0,
                        Opcode.READ_FILE,
                        Opcode.HALT
                    ]), ['forbidden.txt']);
                }).toThrow(/Security Error: READ permission denied/);

            } finally {
                if (fs.existsSync('allowed.txt')) fs.unlinkSync('allowed.txt');
                if (fs.existsSync('forbidden.txt')) fs.unlinkSync('forbidden.txt');
            }
        });
    });

    describe('VULN-CYBER-03: Shell Injection in RUN_CMD', () => {
        it('should THROW Security Error on shell metacharacters', () => {
            const vm = new VM({ run: true }, false); 
            
            const maliciousCmd = 'echo hello; touch injected_cyber.txt';
            
            expect(() => {
                vm.run(new Int32Array([
                    Opcode.PUSH_STR, 0,
                    Opcode.RUN_CMD,
                    Opcode.HALT
                ]), [maliciousCmd]);
            }).toThrow(/Security Error: Shell metacharacters, newlines, or redirection are not allowed/);
            
            const injectedFileExists = fs.existsSync('injected_cyber.txt');
            expect(injectedFileExists).toBe(false);
        });
    });

    describe('VULN-CYBER-04: REPL Memory Leak', () => {
        it('should clear stack on error in runSnippet', () => {
            const vm = new VM();
            
            // First snippet: leaves something on stack then throws
            const bytecode1 = new Int32Array([
                Opcode.PUSH, 42,
                Opcode.PUSH, 0,
                Opcode.PUSH, 0,
                Opcode.DIV, // Should throw Division by zero, stack before was [42, 0, 0]
                Opcode.HALT
            ]);
            
            expect(() => vm.runSnippet(bytecode1, [], 0)).toThrow(/Division by zero/);
            
            // Second snippet: check if 42 is still there
            const bytecode2 = new Int32Array([
                Opcode.PUSH, 10,
                Opcode.ADD, // If 42 was cleared, result in Stack Underflow
                Opcode.PRINT,
                Opcode.HALT
            ]);
            
            expect(() => vm.runSnippet(bytecode2, [], 0)).toThrow(/Stack Underflow/);
        });
    });
});
