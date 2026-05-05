
import { describe, it, expect } from 'vitest';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { VM } from '../../packages/runtime/src/vm/VM';

describe('Resource Exhaustion Audit', () => {
    it('should prevent infinite loops via instruction limit', async () => {
        const source = `
        while (true) {
            let x = 1
        }
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow('Maximum instruction limit reached');
    });

    it('should prevent infinite string growth', async () => {
        const source = `
        let s = "a"
        while (true) {
            s = s + s
        }
        `;
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const ast = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(ast);

        const vm = new VM();
        await expect(vm.run(bytecode, stringPool)).rejects.toThrow('String length exceeds limit');
    });
});
