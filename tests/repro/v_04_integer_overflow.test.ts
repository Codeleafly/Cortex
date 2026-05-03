import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '../../packages/frontend/src';

describe('VULN-NEW-04: Integer Overflow in Bytecode', () => {
    it('should throw an error for numeric literals that exceed 32-bit signed integer range', () => {
        const source = `let x = 3000000000`; // Exceeds 2^31 - 1
        
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        
        // This should throw because 3,000,000,000 > 2,147,483,647
        expect(() => compiler.compile(statements)).toThrow(/Integer Overflow: Numeric literal 3000000000 exceeds 32-bit signed integer range/);
    });

    it('should throw an error for negative numeric literals that are too small', () => {
        const source = `let x = -3000000000`; 
        
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        
        expect(() => compiler.compile(statements)).toThrow(/Integer Overflow/);
    });
});
