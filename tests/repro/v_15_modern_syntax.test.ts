import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

describe('Modern Syntax: is/mut', () => {
    it('should allow constant declaration with is', async () => {
        const source = `
        is name = "Nox"
        print name
        `;
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(lexer.tokenize()));
        const vm = new VM();
        await vm.run(bytecode, stringPool);
        expect(vm.logs).toContain("Nox");
    });

    it('should THROW when re-assigning is', async () => {
        const source = `
        is name = "Nox"
        name = "New"
        `;
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        expect(() => compiler.compile(parser.parse(lexer.tokenize()))).toThrow(/Immutable Error/);
    });

    it('should allow mutable declaration with mut', async () => {
        const source = `
        mut score = 100
        score = 105
        print score
        `;
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(lexer.tokenize()));
        const vm = new VM();
        await vm.run(bytecode, stringPool);
        expect(vm.logs).toContain("105");
    });
});
