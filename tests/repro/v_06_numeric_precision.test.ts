
import { describe, it, expect } from 'vitest';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { VM } from '../../packages/runtime/src/vm/VM';

describe('Numeric Precision Audit', () => {
    it('should handle large calculations starting from small numbers', async () => {
        const source = `
        let a = 2147483647
        let b = 2147483647
        let c = a + b
        print c
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        await vm.run(bytecode, stringPool);
        expect(vm.logs[0]).toBe("4294967294");
    });

    it('should detect precision loss in very large multiplications', async () => {
        const source = `
        let a = 2147483647
        let b = 2147483647
        let c = a * b
        print c
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow('Numeric Precision Error');
    });
});
