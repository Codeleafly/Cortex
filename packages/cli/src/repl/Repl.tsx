import React, { useState, useRef } from 'react';
import { render, Text, Box, useApp, Static } from 'ink';
import TextInput from 'ink-text-input';
import { Lexer, Parser, Compiler } from '@cortex/frontend';
import { VM } from '@cortex/runtime';

const HELP_TEXT = `
Available Commands:
  .help    - Show this help message
  .reset   - Reset the VM and environment
  .exit    - Exit the REPL
  .editor  - Toggle multi-line editor mode (WIP)

Syntax Examples:
  let x = 10
  print x + 5
  while (x > 0) { print x; x = x - 1 }
`;

interface ReplProps {
    initialPermissions?: { read: boolean, write: boolean, run: boolean };
    whitelists?: { read: string[], write: string[], run: string[] };
}

const REPL = ({ initialPermissions, whitelists }: ReplProps) => {
    const { exit } = useApp();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error' | 'info', text: string }[]>([
        { type: 'info', text: 'Welcome to Cortex REPL! Type .help for commands.' }
    ]);
    const [editorMode, setEditorMode] = useState(false);
    const [multiLineInput, setMultiLineInput] = useState('');

    const createVM = () => {
        const vm = new VM(initialPermissions, true);
        if (whitelists) {
            for (const path of whitelists.read) vm.addWhitelist('read', path);
            for (const path of whitelists.write) vm.addWhitelist('write', path);
            for (const path of whitelists.run) vm.addWhitelist('run', path);
        }
        return vm;
    };

    // Persist Compiler and VM across the session
    const compilerRef = useRef(new Compiler());
    const vmRef = useRef(createVM());

    const execute = (code: string) => {
        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            
            // Incremental Compilation
            const { bytecode, stringPool, startIp } = compilerRef.current.compileSnippet(statements);
            
            // Incremental Execution
            vmRef.current.runSnippet(bytecode, stringPool, startIp);
            
            return { success: true, logs: vmRef.current.logs };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    };

    const handleSubmit = (val: string) => {
        const fullInput = editorMode ? multiLineInput + val + '\n' : val;
        const trimmed = val.trim();
        
        if (!editorMode && trimmed === '.exit') {
            exit();
            return;
        }

        if (!editorMode && trimmed === '.help') {
            setHistory(prev => [...prev, { type: 'input', text: val }, { type: 'info', text: HELP_TEXT }]);
            setInput('');
            return;
        }

        if (!editorMode && trimmed === '.reset') {
            compilerRef.current = new Compiler();
            vmRef.current = createVM();
            setHistory([{ type: 'info', text: 'Environment reset.' }]);
            setInput('');
            return;
        }

        if (!editorMode && trimmed === '.editor') {
            setHistory(prev => [...prev, { type: 'input', text: val }, { type: 'info', text: 'Multi-line editor mode enabled. Submit an empty line or matching braces to execute.' }]);
            setEditorMode(true);
            setInput('');
            return;
        }

        // Advanced Multi-line Detection
        const openBraces = (fullInput.match(/\{/g) || []).length;
        const closeBraces = (fullInput.match(/\}/g) || []).length;
        const openParens = (fullInput.match(/\(/g) || []).length;
        const closeParens = (fullInput.match(/\)/g) || []).length;

        if (openBraces > closeBraces || openParens > closeParens) {
            setMultiLineInput(fullInput);
            setHistory(prev => [...prev, { type: 'input', text: val }]);
            setEditorMode(true);
            setInput('');
            return;
        }

        // Execute code
        setHistory(prev => [...prev, { type: 'input', text: val }]);
        const result = execute(fullInput);
        if (result.success) {
            result.logs!.forEach((log: string) => {
                setHistory(prev => [...prev, { type: 'output', text: log }]);
            });
        } else {
            setHistory(prev => [...prev, { type: 'error', text: `Error: ${result.error}` }]);
        }
        
        setInput('');
        setMultiLineInput('');
        setEditorMode(false);
    };

    return (
        <Box flexDirection="column">
            <Static items={history}>
                {(item, index) => (
                    <Box key={index}>
                        {item.type === 'input' && <Text color="cyan">{index === 0 ? '›' : ' ' } {item.text}</Text>}
                        {item.type === 'output' && <Text color="green">{item.text}</Text>}
                        {item.type === 'error' && <Text color="red">{item.text}</Text>}
                        {item.type === 'info' && <Text color="yellow" italic>{item.text}</Text>}
                    </Box>
                )}
            </Static>
            
            <Box marginTop={1}>
                <Text color="cyan">{editorMode ? '... ' : '› '}</Text>
                <TextInput 
                    value={input} 
                    onChange={setInput} 
                    onSubmit={handleSubmit} 
                />
            </Box>
        </Box>
    );
};

export function startRepl(initialPermissions?: ReplProps['initialPermissions'], whitelists?: ReplProps['whitelists']) {
    render(<REPL initialPermissions={initialPermissions} whitelists={whitelists} />);
}