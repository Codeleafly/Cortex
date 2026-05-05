import React from 'react';
import { render } from 'ink';
import fs from 'fs';
import path from 'path';
import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';
import { ErrorDiagnostic } from '../diagnostic/ErrorHandler.js';
import { startRepl } from '../repl/Repl.js';

export const NOX_VERSION = '1.0.0';

export async function runCommand(args: string[]) {
    let filePath = '';
    let scriptArgs: string[] = [];
    const flags = { read: false, write: false, run: false };
    const whitelists: { read: string[], write: string[], run: string[] } = { read: [], write: [], run: [] };

    // Basic arg parsing for run
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--allow=')) {
            const perms = arg.split('=')[1].split(',');
            for (const p of perms) {
                if (p === 'read') flags.read = true;
                if (p === 'write') flags.write = true;
                if (p === 'run') flags.run = true;
                if (p === 'all') { flags.read = true; flags.write = true; flags.run = true; }
            }
        } else if (arg === '--allow-all') {
            flags.read = true; flags.write = true; flags.run = true;
        } else if (!filePath) {
            filePath = arg;
        } else {
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
        for (const p of whitelists.read) vm.addWhitelist('read', p);
        for (const p of whitelists.write) vm.addWhitelist('write', p);
        for (const p of whitelists.run) vm.addWhitelist('run', p);

        await vm.run(bytecode, stringPool, scriptArgs);
    } catch (err) {
        const { unmount } = render(<ErrorDiagnostic error={err} sourceCode={source} filePath={filePath} />);
        unmount();
        process.exit(1);
    }
}
