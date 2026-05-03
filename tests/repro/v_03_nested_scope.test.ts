import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '../../packages/frontend/src';
import { VM } from '../../packages/runtime/src';

describe('VULN-NEW-03: Broken Nested Function Scope', () => {
    it('should NOT allow accessing outer function variables from nested functions (until closures are implemented)', () => {
        const source = `
            fn outer() {
                let x = 10
                fn inner() {
                    print x
                }
                inner()
            }
            outer()
        `;
        
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        
        // This SHOULD throw a compilation error because 'x' is neither global nor local to 'inner'
        expect(() => compiler.compile(statements)).toThrow(/Closure Error: Cannot access non-global variable 'x' from nested function/);
    });
});
