import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@cortex/frontend';
import { VM } from '@cortex/runtime';

describe('Cortex Lexer Escape Sequences', () => {
    const getLogs = (source: string) => {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(statements);
        const vm = new VM();
        vm.run(bytecode, stringPool);
        return vm.logs;
    };

    it('should handle standard escapes', () => {
        const code = `print "line1\\nline2\\ttab"`;
        const logs = getLogs(code);
        expect(logs[0]).toBe('line1\nline2\ttab');
    });

    it('should handle ANSI escape \\e', () => {
        const code = `print "\\e[31mRed Text\\e[0m"`;
        const logs = getLogs(code);
        expect(logs[0]).toBe('\x1b[31mRed Text\x1b[0m');
    });

    it('should handle escaped quotes', () => {
        const code = `print "He said \\"Hello\\" and I said 'Hi'"`;
        const logs = getLogs(code);
        expect(logs[0]).toBe('He said "Hello" and I said \'Hi\'');
    });
});
