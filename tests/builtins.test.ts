import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

function run(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser();
    const statements = parser.parse(tokens);
    const compiler = new Compiler();
    const { bytecode, stringPool } = compiler.compile(statements);
    const vm = new VM({ read: true, write: true, run: true }, false);
    vm.run(bytecode, stringPool);
    return vm.logs;
}

describe('Nox Built-ins Audit', () => {
    it('should handle str_at correctly', () => {
        const logs = run(`print str_at("hello", 1)`);
        expect(logs).toEqual(['e']);
    });

    it('should handle str_at out of bounds', () => {
        const logs = run(`print str_at("hello", 10)`);
        expect(logs).toEqual(['null']);
    });

    it('should handle str_len correctly', () => {
        const logs = run(`print str_len("hello")`);
        expect(logs).toEqual(['5']);
    });

    it('should handle str_upper correctly', () => {
        const logs = run(`print str_upper("hello")`);
        expect(logs).toEqual(['HELLO']);
    });

    it('should handle str_words correctly', () => {
        const logs = run(`print str_words("  this is  a test  ")`);
        expect(logs).toEqual(['4']);
    });

    it('should handle str_words with empty string', () => {
        const logs = run(`print str_words("")`);
        expect(logs).toEqual(['0']);
    });

    it('should handle inequality operator !=', () => {
        const logs = run(`
            print 1 != 2
            print 1 != 1
            print "a" != "b"
        `);
        expect(logs).toEqual(['1', '0', '1']);
    });

    it('should handle logical short-circuiting &&', () => {
        const logs = run(`
            let x = 0
            fn side_effect() { x = 1 return 1 }
            if (0 && side_effect()) { print "no" }
            print x
        `);
        expect(logs).toEqual(['0']);
    });

    it('should handle logical short-circuiting ||', () => {
        const logs = run(`
            let x = 0
            fn side_effect() { x = 1 return 1 }
            if (1 || side_effect()) { print "yes" }
            print x
        `);
        expect(logs).toEqual(['yes', '0']);
    });
});
