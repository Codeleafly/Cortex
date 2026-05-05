import React, { useState, useRef, useMemo } from 'react';
import { render, Box, useApp } from 'ink';
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { REPLHistory, HistoryItem } from './components/REPLHistory.js';
import { REPLInput } from './components/REPLInput.js';
import { REPLStatus } from './components/REPLStatus.js';

const HELP_TEXT = `
Available Commands:
  .help    - Show this help message
  .reset   - Reset the VM and environment
  .exit    - Exit the REPL

Syntax Examples (Modern Nox):
  is x = 10                  (Constant)
  mut y = 5                  (Mutable)
  print x + y
  fn add(a, b) => a + b      (Arrow)
  if x > 5 { print "Large" } (No Parens)
  "nox" |> print             (Pipe)
`;

interface ReplProps {
    initialPermissions?: { read: boolean, write: boolean, run: boolean };
    whitelists?: { read: string[], write: string[], run: string[] };
}

const REPL = ({ initialPermissions, whitelists }: ReplProps) => {
    const { exit } = useApp();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([
        { id: 'init', type: 'info', text: 'Welcome to Nox REPL! High-performance interactive mode enabled.' }
    ]);
    const [accumulatedInput, setAccumulatedInput] = useState('');
    
    // Maintain execution state
    const engine = useRef(new ExecutionEngine(initialPermissions, whitelists));

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const isComplete = (code: string): boolean => {
        const trimmed = code.trim();
        if (!trimmed) return true;

        // Braces/Parens balance
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        
        if (openBraces !== closeBraces || openParens !== closeParens) return false;

        // Check for trailing operators or keywords that expect more
        const lastLine = trimmed.split('\n').pop()?.trim() || '';
        
        // Ends with pipe or arithmetic operator
        if (lastLine.endsWith('|>') || lastLine.endsWith('+') || lastLine.endsWith('-') || 
            lastLine.endsWith('*') || lastLine.endsWith('/') || lastLine.endsWith('=')) {
            return false;
        }

        // Ends with fn signature but no body
        if (lastLine.startsWith('fn ') && !lastLine.includes('=>') && !lastLine.includes('{')) {
            return false;
        }

        // Incomplete if/while/match (no block)
        if ((lastLine.startsWith('if ') || lastLine.startsWith('while ') || lastLine.startsWith('match ')) && !lastLine.includes('{')) {
            return false;
        }

        return true;
    };

    const handleSubmit = (val: string) => {
        const trimmed = val.trim();
        
        if (trimmed === '.exit') {
            exit();
            return;
        }

        if (trimmed === '.help') {
            setHistory(prev => [
                ...prev, 
                { id: generateId(), type: 'input', text: val }, 
                { id: generateId(), type: 'info', text: HELP_TEXT }
            ]);
            setInput('');
            return;
        }

        if (trimmed === '.reset') {
            engine.current.reset(initialPermissions, whitelists);
            setHistory([{ id: generateId(), type: 'info', text: 'Environment reset. Memory cleared.' }]);
            setInput('');
            setAccumulatedInput('');
            return;
        }

        const currentFullInput = accumulatedInput + (accumulatedInput ? '\n' : '') + val;

        if (!isComplete(currentFullInput)) {
            setHistory(prev => [...prev, { id: generateId(), type: 'input', text: val, isContinuation: accumulatedInput.length > 0 }]);
            setAccumulatedInput(currentFullInput);
            setInput('');
            return;
        }

        // Execute code
        setHistory(prev => [...prev, { id: generateId(), type: 'input', text: val, isContinuation: accumulatedInput.length > 0 }]);
        const result = engine.current.execute(currentFullInput);
        
        // Handle output
        const newHistory: HistoryItem[] = [];
        result.logs.forEach(log => {
            newHistory.push({ id: generateId(), type: 'output', text: log });
        });

        if (!result.success) {
            newHistory.push({ id: generateId(), type: 'error', text: result.error || 'Unknown error' });
        }
        
        setHistory(prev => [...prev, ...newHistory]);
        setInput('');
        setAccumulatedInput('');
    };

    return (
        <Box flexDirection="column" padding={1}>
            <REPLHistory history={history} />
            <REPLInput 
                input={input} 
                setInput={setInput} 
                onSubmit={handleSubmit} 
                isMultiline={accumulatedInput.length > 0} 
            />
            <REPLStatus />
        </Box>
    );
};

export function startRepl(initialPermissions?: ReplProps['initialPermissions'], whitelists?: ReplProps['whitelists']) {
    render(<REPL initialPermissions={initialPermissions} whitelists={whitelists} />);
}
