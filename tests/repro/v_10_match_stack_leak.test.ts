import { expect, test, describe } from 'vitest';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { VM } from '../../packages/runtime/src/vm/VM';

describe('VULN-STACK-01: Match Statement Stack Leak', () => {
    test('Match statement should not leak values on the stack', async () => {
        const code = `
        match 1 {
            1 => { "matched" }
        }
        `;
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(tokens));
        
        const vm = new VM();
        await vm.run(bytecode, stringPool);
        
        // Match value '1' should be popped.
        expect(vm.state.stack.length).toBe(0);
    });

    test('Match statement with no match should not leak', async () => {
        const code = `
        match 2 {
            1 => { "no" }
        }
        `;
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(tokens));
        
        const vm = new VM();
        await vm.run(bytecode, stringPool);
        expect(vm.state.stack.length).toBe(0);
    });
});
