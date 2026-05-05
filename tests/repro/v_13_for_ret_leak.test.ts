import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

describe('VULN-FOR-RET-LEAK: For Loop Return Stack Leak', () => {
    it('should not leak iterator on the stack when returning from a loop', async () => {
        const source = `
        fn test_leak() {
            for i in 1..10 {
                return i
            }
        }
        print test_leak()
        `;
        
        const lexer = new Lexer(source);
        const parser = new Parser();
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(parser.parse(lexer.tokenize()));
        
        const vm = new VM();
        await vm.run(bytecode, stringPool);
        
        // If RET handles cleanup (which it does by truncating the stack), this should pass.
        expect(vm.logs).toContain("1");
        expect(vm.state.stack.length).toBe(0); // vm.run pops the last value if it's an ExprStmt, 
                                               // but here 'print' handles it.
    });
});
