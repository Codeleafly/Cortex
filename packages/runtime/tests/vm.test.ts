import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@cortex/frontend';
import { VM } from '@cortex/runtime';
import fs from 'fs';
import path from 'path';

function runFile(filePath: string) {
    const source = fs.readFileSync(filePath, 'utf-8');
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser();
    const statements = parser.parse(tokens);
    const compiler = new Compiler();
    const { bytecode, stringPool } = compiler.compile(statements);
    const vm = new VM();
    vm.run(bytecode, stringPool);
    return vm.logs;
}

describe('Cortex File-Based Integration Tests', () => {
    it('should pass test_01_arithmetic.ctx', () => {
        const logs = runFile('tests/ctx/test_01_arithmetic.ctx');
        expect(logs).toEqual(['50']);
    });

    it('should pass test_02_strings.ctx', () => {
        const logs = runFile('tests/ctx/test_02_strings.ctx');
        expect(logs).toEqual(['hello cortex']);
    });

    it('should pass test_03_logic.ctx', () => {
        const logs = runFile('tests/ctx/test_03_logic.ctx');
        expect(logs).toEqual(['0', '1', '0']);
    });

    it('should pass test_04_functions.ctx', () => {
        const logs = runFile('tests/ctx/test_04_functions.ctx');
        expect(logs).toEqual(['15']);
    });

    it('should pass test_05_loops.ctx', () => {
        const logs = runFile('tests/ctx/test_05_loops.ctx');
        expect(logs).toEqual(['3', '2', '1']);
    });

    it('should pass test_06_comments.ctx', () => {
        const logs = runFile('tests/ctx/test_06_comments.ctx');
        expect(logs).toEqual(['comment test']);
    });
});
