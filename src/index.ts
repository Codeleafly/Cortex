#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Lexer, Compiler, VM } from './cortex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Start REPL
        const replPath = path.join(__dirname, 'cli', 'Repl.js');
        
        if (fs.existsSync(replPath)) {
            const child = spawn('node', [replPath], { stdio: 'inherit' });
            child.on('exit', () => process.exit());
        } else {
            console.error("Error: REPL not found. Please run 'npm run build' first.");
        }
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
        try {
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const compiler = new Compiler(tokens);
            const { bytecode, stringPool } = compiler.compile();
            const vm = new VM(bytecode, stringPool);
            vm.run();
        } catch (err: any) {
            console.error(`Runtime Error: ${err.message}`);
        }
    }
}

main();
