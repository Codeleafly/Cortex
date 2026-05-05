import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

describe('Nox Security Audits', () => {
    const run = async (source: string, flags: any = {}) => {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(statements);
        const vm = new VM(flags, false);
        await vm.run(bytecode, stringPool);
    };

    it('should block path traversal in read_file', async () => {
        const code = `print read_file("../../../etc/passwd")`;
        // Without flags, it will prompt. In tests, we want it to throw or we can mock it.
        // For now, let's assume if it requests permission and we don't provide it, it fails.
        // But the prompt hangs. We need to pass flags that don't cover the path.
        await expect(run(code, { read: false })).rejects.toThrow();
    });

    it('should allow local file access with flags', async () => {
        const code = `
            write_file("local_test.txt", "safe")
            print file_exists("local_test.txt")
        `;
        await expect(run(code, { read: true, write: true })).resolves.not.toThrow();
    });
});
