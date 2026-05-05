import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

describe('Async Integrity: Sleep', () => {
    it('should wait for the specified time using sleep and !', async () => {
        const source = `
        print "start"
        sleep(100)!
        print "end"
        `;
        
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(lexer.tokenize()));
        
        const vm = new VM();
        const start = Date.now();
        await vm.run(bytecode, stringPool);
        const duration = Date.now() - start;
        
        expect(vm.logs).toContain("start");
        expect(vm.logs).toContain("end");
        expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should NOT wait if ! is missing', async () => {
        const source = `
        print "start"
        sleep(1000)
        print "end"
        `;
        
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(lexer.tokenize()));
        
        const vm = new VM();
        const start = Date.now();
        await vm.run(bytecode, stringPool);
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(100);
    });
});
