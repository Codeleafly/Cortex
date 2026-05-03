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
    const rawArgs = process.argv.slice(2);
    const flags = {
        read: false,
        write: false,
        run: false
    };
    const whitelists: { read: string[], write: string[], run: string[] } = {
        read: [],
        write: [],
        run: []
    };
    const args: string[] = [];

    for (const arg of rawArgs) {
        if (arg.startsWith('--allow=')) {
            const perms = arg.split('=')[1].split(',');
            for (const p of perms) {
                if (p === 'read') flags.read = true;
                if (p === 'write') flags.write = true;
                if (p === 'run') flags.run = true;
                if (p === 'all') {
                    flags.read = true;
                    flags.write = true;
                    flags.run = true;
                }
            }
        } else if (arg.startsWith('--allow-read=')) {
            whitelists.read.push(arg.split('=')[1]);
        } else if (arg === '--allow-read') {
            flags.read = true;
        } else if (arg.startsWith('--allow-write=')) {
            whitelists.write.push(arg.split('=')[1]);
        } else if (arg === '--allow-write') {
            flags.write = true;
        } else if (arg.startsWith('--allow-run=')) {
            whitelists.run.push(arg.split('=')[1]);
        } else if (arg === '--allow-run') {
            flags.run = true;
        } else if (arg === '--allow-all') {
            flags.read = true;
            flags.write = true;
            flags.run = true;
        } else {
            args.push(arg);
        }
    }

    if (args.length === 0) {
        // Start REPL
        startRepl(flags, whitelists);
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
            const vm = new VM(flags);
            
            // Apply granular whitelists
            for (const path of whitelists.read) vm.addWhitelist('read', path);
            for (const path of whitelists.write) vm.addWhitelist('write', path);
            for (const path of whitelists.run) vm.addWhitelist('run', path);

            vm.run(bytecode, stringPool, scriptArgs);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`Runtime Error: ${message}`);
        }
    }
}

main();