#!/usr/bin/env node
import { runCommand, NOX_VERSION } from './commands/run.js';
import { startRepl } from './repl/Repl.js';

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`Nox v${NOX_VERSION}`);
        console.log(`Use 'nox help' for usage instructions or 'nox repl' to start interactive mode.\n`);
        // We can default to repl or just show help. Let's default to repl for ease.
        startRepl({read: false, write: false, run: false}, {read: [], write: [], run: []});
        return;
    }

    const command = args[0];

    switch (command) {
        case 'run':
            await runCommand(args.slice(1));
            break;
        case 'repl':
            startRepl({read: false, write: false, run: false}, {read: [], write: [], run: []});
            break;
        case 'version':
        case '-v':
        case '--version':
            console.log(`Nox v${NOX_VERSION}`);
            break;
        case 'help':
        case '-h':
        case '--help':
            console.log(`Nox - High-Performance Programming Language\n`);
            console.log(`Usage:`);
            console.log(`  nox run <file.nx> [flags] [args...]   Run a Nox script`);
            console.log(`  nox repl                              Start the interactive REPL`);
            console.log(`  nox version                           Show version info`);
            console.log(`  nox help                              Show this help message\n`);
            console.log(`Flags:`);
            console.log(`  --allow-read                          Allow file read access`);
            console.log(`  --allow-write                         Allow file write access`);
            console.log(`  --allow-run                           Allow shell command execution`);
            console.log(`  --allow-all                           Allow all permissions`);
            break;
        default:
            // For backward compatibility: if the first arg is a file (ends with .nx or exists), just run it
            if (command.endsWith('.nx') || command.endsWith('.ctx')) {
                await runCommand(args);
            } else {
                console.error(`Unknown command: ${command}`);
                console.log(`Use 'nox help' to see available commands.`);
                process.exit(1);
            }
            break;
    }
}

main();
