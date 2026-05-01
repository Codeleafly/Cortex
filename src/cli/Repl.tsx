import React, { useState, useEffect } from 'react';
import { render, Text, Box, useInput, useApp, Static } from 'ink';
import TextInput from 'ink-text-input';
import { Lexer, Compiler, VM } from '../cortex.js';

const HELP_TEXT = `
Available Commands:
  .help    - Show this help message
  .reset   - Reset the VM and environment
  .exit    - Exit the REPL
  .editor  - Toggle multi-line editor mode (WIP)

Syntax Examples:
  let x = 10;
  print x + 5;
  while (x > 0) { print x; let x = x - 1; }
`;

const REPL = () => {
    const { exit } = useApp();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error' | 'info', text: string }[]>([
        { type: 'info', text: 'Welcome to Cortex REPL! Type .help for commands.' }
    ]);
    const [editorMode, setEditorMode] = useState(false);
    const [multiLineInput, setMultiLineInput] = useState('');

    const execute = (code: string) => {
        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const compiler = new Compiler(tokens);
            const { bytecode, stringPool } = compiler.compile();
            const vm = new VM(bytecode, stringPool);
            
            // Capture console.log output if needed, but our VM has vm.logs
            vm.run();
            
            return { success: true, logs: vm.logs };
        } catch (err: any) {
            return { success: false, error: err.message };
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
            setHistory([{ type: 'info', text: 'Environment reset.' }]);
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
            result.logs!.forEach(log => {
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

render(<REPL />);
