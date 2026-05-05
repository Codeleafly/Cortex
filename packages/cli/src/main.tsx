#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { runCommand } from './commands/run.js';
import { startRepl } from './repl/Repl.js';
import { Help } from './components/Help.js';
import { Version } from './components/Version.js';

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Show version then start REPL
        const { unmount } = render(<Version />);
        await new Promise(resolve => setTimeout(resolve, 50));
        unmount();
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
        case '--version': {
            const { waitUntilExit } = render(<Version />);
            // For version we can just exit after render
            await new Promise(resolve => setTimeout(resolve, 50));
            process.exit(0);
            break;
        }
        case 'help':
        case '-h':
        case '--help': {
            const { waitUntilExit } = render(<Help />);
            await new Promise(resolve => setTimeout(resolve, 50));
            process.exit(0);
            break;
        }
        default:
            // For backward compatibility: if the first arg is a file (ends with .nx or exists), just run it
            if (command.endsWith('.nx') || command.endsWith('.ctx')) {
                await runCommand(args);
            } else {
                console.error(`Unknown command: ${command}`);
                render(<Help />);
                await new Promise(resolve => setTimeout(resolve, 50));
                process.exit(1);
            }
            break;
    }
}

main();
