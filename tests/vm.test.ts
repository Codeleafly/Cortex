import { describe, it, expect } from 'vitest';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';
import fs from 'fs';
import path from 'path';

async function runFile(filePath: string) {
    const source = fs.readFileSync(filePath, 'utf-8');
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser();
    const statements = parser.parse(tokens);
    const compiler = new Compiler();
    const { bytecode, stringPool } = compiler.compile(statements);
    const vm = new VM();
    await vm.run(bytecode, stringPool);
    return vm.logs;
}

describe('Nox File-Based Integration Tests', () => {
    it('should pass test_01_arithmetic.nx', async () => {
        const logs = await runFile('tests/ctx/test_01_arithmetic.nx');
        expect(logs).toEqual(['50']);
    });

    it('should pass test_02_strings.nx', async () => {
        const logs = await runFile('tests/ctx/test_02_strings.nx');
        expect(logs).toEqual(['hello nox']);
    });

    it('should pass test_03_logic.nx', async () => {
        const logs = await runFile('tests/ctx/test_03_logic.nx');
        expect(logs).toEqual(['0', '1', '0']);
    });

    it('should pass test_04_functions.nx', async () => {
        const logs = await runFile('tests/ctx/test_04_functions.nx');
        expect(logs).toEqual(['15']);
    });

    it('should pass test_05_loops.nx', async () => {
        const logs = await runFile('tests/ctx/test_05_loops.nx');
        expect(logs).toEqual(['3', '2', '1']);
    });

    it('should pass test_06_comments.nx', async () => {
        const logs = await runFile('tests/ctx/test_06_comments.nx');
        expect(logs).toEqual(['comment test']);
    });

    it('should pass test_07_ifelse.nx', async () => {
        const logs = await runFile('tests/ctx/test_07_ifelse.nx');
        expect(logs).toEqual(['then', 'else2']);
    });
});
