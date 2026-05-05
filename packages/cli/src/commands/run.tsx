import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import path from 'path';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';
import { ErrorDiagnostic } from '../diagnostic/ErrorHandler.js';
import { NOX_VERSION } from '../version.js';

export async function runCommand(args: string[]) {
    let filePath = '';
    let scriptArgs: string[] = [];
    const flags = { read: false, write: false, run: false };
    const whitelists: { read: string[], write: string[], run: string[] } = { read: [], write: [], run: [] };

    // Basic arg parsing for run
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--allow-read')) {
            flags.read = true;
        } else if (arg.startsWith('--allow-write')) {
            flags.write = true;
        } else if (arg.startsWith('--allow-run')) {
            flags.run = true;
        } else if (arg === '--allow-all') {
            flags.read = true; flags.write = true; flags.run = true;
        } else if (!filePath && !arg.startsWith('--')) {
            filePath = arg;
        } else if (filePath) {
            scriptArgs.push(arg);
        }
    }

    if (!filePath) {
        console.error('Error: nox run requires a file path.');
        process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    
    try {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser();
        const statements = parser.parse(tokens);
        const compiler = new Compiler();
        const { bytecode, stringPool } = compiler.compile(statements);
        
        const vm = new VM(flags);
        // Map whitelists if any (WIP)

        await vm.run(bytecode, stringPool, scriptArgs);
    } catch (err) {
        const { waitUntilExit } = render(<ErrorDiagnostic error={err} sourceCode={source} filePath={filePath} />);
        // Give it a moment to render before exiting if it's not interactive
        await new Promise(resolve => setTimeout(resolve, 100));
        process.exit(1);
    }
}
