import { expect, test, describe } from 'vitest';
import { Compiler } from '../../packages/frontend/src/compiler/Compiler';
import { Parser } from '../../packages/frontend/src/parser/Parser';
import { Lexer } from '../../packages/frontend/src/lexer/Lexer';
import { VM } from '../../packages/runtime/src/vm/VM';

describe('VULN-STACK-02: Function Return Stack Leak', () => {
    test('Function return should clean up local stack artifacts', async () => {
        const code = `
        fn leak() {
            for i in 0..5 {
                return 1
            }
        }
        leak()
        leak()
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
