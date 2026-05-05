import { describe, it, expect } from 'vitest';
import { VM } from '../../packages/runtime/src/index.js';
import { Compiler } from '../../packages/frontend/src/index.js';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer.js';
import { Parser } from '../../packages/frontend/src/parser/Parser.js';

describe('VULN-STACK-03: Iterator Stack Leak', () => {
    it('should throw Type Error and not leak stack when iterating over non-iterable', async () => {
        const code = `
            mut i = 0;
            while i < 1100 {
                for x in 123 { }
                i = i + 1;
            }
        `;

        const lexer = new Lexer(code);
        const parser = new Parser();
        const statements = parser.parse(lexer.tokenize());
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(statements);

        const vm = new VM();
        
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow("is not iterable");
    });
});
