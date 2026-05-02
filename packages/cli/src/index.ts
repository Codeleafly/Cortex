#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Lexer, Parser, Compiler } from '@cortex/frontend';
import { VM } from '@cortex/runtime';
import { startRepl } from './repl/Repl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Start REPL
        startRepl();
    } else {
        const filePath = args[0];
        if (!filePath.endsWith('.ctx')) {
            console.warn("Hint: It is recommended to use the '.ctx' extension for Cortex files.");
        }

        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found: ${filePath}`);
            process.exit(1);
        }

        const source = fs.readFileSync(filePath, 'utf-8');
        const scriptArgs = args.slice(1);
        try {
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            const compiler = new Compiler();
            const { bytecode, stringPool } = compiler.compile(statements);
            const vm = new VM();
            vm.run(bytecode, stringPool, scriptArgs);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`Runtime Error: ${message}`);
        }
    }
}

main();