import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@cortex/frontend';
import { VM } from '@cortex/runtime';

describe('Cortex Security Audits', () => {
    const run = (source: string) => {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(statements);
        const vm = new VM();
        vm.run(bytecode, stringPool);
    };

    it('should block path traversal in read_file', () => {
        const code = `print read_file("../../../etc/passwd")`;
        expect(() => run(code)).toThrow(/Security Error: Sandbox escape attempt/);
    });

    it('should block path traversal in write_file', () => {
        const code = `write_file("/tmp/evil.txt", "hacked")`;
        expect(() => run(code)).toThrow(/Security Error: Sandbox escape attempt/);
    });

    it('should allow local file access', () => {
        const code = `
            write_file("local_test.txt", "safe")
            print file_exists("local_test.txt")
        `;
        // This should not throw if safeResolve is working correctly
        expect(() => run(code)).not.toThrow();
    });
});
