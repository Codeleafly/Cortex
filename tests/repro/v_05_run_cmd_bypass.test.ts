
import { describe, it, expect } from 'vitest';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { VM } from '../../packages/runtime/src/vm/VM';

describe('VULN-05: RUN_CMD Shell Injection Bypass', () => {
    it('should NOT allow shell injection via newline', async () => {
        const source = `
        let cmd = "echo hello\\nls -la"
        run_command(cmd)
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        // It should either fail or just echo "hello\nls -la" safely.
        // If it executes 'ls -la', it's a vulnerability.
        
        // However, execSync("echo hello\nls -la") will execute both in most shells.
        
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow('Security Error');
    });

    it('should NOT allow shell injection via redirection', async () => {
        const source = `
        let cmd = "echo evil > /tmp/evil.txt"
        run_command(cmd)
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow('Security Error');
    });
});
