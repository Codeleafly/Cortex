import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import { NOX_VERSION } from '../version.js';

interface ErrorDiagnosticProps {
    error: Error | any;
    sourceCode?: string;
    filePath?: string;
}

function sanitizePath(filePath: string): string {
    const home = os.homedir();
    if (filePath.startsWith(home)) {
        return filePath.replace(home, '~');
    }
    return filePath;
}

export function ErrorDiagnostic({ error, sourceCode, filePath }: ErrorDiagnosticProps) {
    let lineNum: number | null = null;
    let colNum: number | null = null;

    // Enhanced error extraction
    const lineMatch = error.message?.match(/line\s+(\d+)/i);
    if (lineMatch) {
        lineNum = parseInt(lineMatch[1], 10);
    } else if (error.line) {
        lineNum = error.line;
    }

    if (error.column) {
        colNum = error.column;
    }

    let snippet: React.ReactNode = null;

    if (lineNum !== null && sourceCode) {
        const lines = sourceCode.split('\n');
        const errorIndex = lineNum - 1;
        const startLine = Math.max(0, errorIndex - 5);
        const endLine = Math.min(lines.length - 1, errorIndex + 5);
        
        const snippetLines = [];
        for (let i = startLine; i <= endLine; i++) {
            const isErrorLine = i === errorIndex;
            const lineNo = (i + 1).toString().padStart(4, ' ');
            
            const linePrefix = isErrorLine 
                ? chalk.bgRed.whiteBright(` ${lineNo} `) 
                : chalk.gray(` ${lineNo} `);
            
            const lineContent = isErrorLine 
                ? chalk.red(lines[i]) 
                : chalk.white(lines[i]);

            snippetLines.push(
                <Box key={i}>
                    <Text>{linePrefix} {lineContent}</Text>
                </Box>
            );

            if (isErrorLine) {
                const padding = ' '.repeat(5);
                const pointer = ' '.repeat(colNum ? colNum - 1 : 0) + chalk.red('^');
                const message = colNum ? chalk.red(`--- Here: Column ${colNum}`) : chalk.red('--- Here');
                
                snippetLines.push(
                    <Box key={`pointer-${i}`}>
                        <Text>{padding} {pointer} {message}</Text>
                    </Box>
                );
            }
        }
        snippet = (
            <Box flexDirection="column" marginY={1} paddingX={1} borderStyle="single" borderColor="red">
                {snippetLines}
            </Box>
        );
    }

    let proTip = null;
    if (error.message?.includes('Undefined variable')) {
        proTip = "Pro Tip: Variables must be declared with 'is' (constant) or 'mut' (mutable) before use.";
    } else if (error.message?.includes('permission denied')) {
        proTip = "Pro Tip: Use --allow-read, --allow-write, or --allow-run flags to grant permissions.";
    } else if (error.message?.includes('Closure Error')) {
        proTip = "Pro Tip: Nox does not support closures yet. Use global variables or pass state explicitly.";
    } else if (error.message?.includes('Unexpected token')) {
        proTip = "Pro Tip: Check for missing braces '{}' or parentheses '()'. Remember that Modern Nox 'if'/'while' don't need parens!";
    }

    return (
        <Box flexDirection="column" padding={1} width={80}>
            <Box borderStyle="bold" borderColor="red" paddingX={1} marginBottom={1}>
                <Text bold color="white" backgroundColor="red"> NOX RUNTIME EXCEPTION </Text>
            </Box>

            <Box marginBottom={1}>
                <Text bold color="red">Type:</Text>
                <Text> {error.name || 'Error'}</Text>
            </Box>

            <Box marginBottom={1}>
                <Box width={12}><Text bold color="red">Message:</Text></Box>
                <Text wrap="truncate-end"> {error.message}</Text>
            </Box>

            {filePath && (
                <Box marginBottom={1}>
                    <Box width={12}><Text bold color="yellow">Location:</Text></Box>
                    <Text color="cyan"> {sanitizePath(filePath)}{lineNum ? `:${lineNum}${colNum ? `:${colNum}` : ''}` : ''}</Text>
                </Box>
            )}

            {snippet}

            {proTip && (
                <Box marginBottom={1} paddingX={1} borderStyle="single" borderColor="yellow">
                    <Text color="yellow" italic>{proTip}</Text>
                </Box>
            )}

            <Box marginTop={1} paddingX={1} borderStyle="round" borderColor="gray" flexDirection="column">
                <Text color="gray" bold>Diagnostic Metadata</Text>
                <Box flexDirection="row" justifyContent="space-between">
                    <Box flexDirection="column">
                        <Text color="gray">OS: {os.platform()} ({os.arch()})</Text>
                        <Text color="gray">Release: {os.release()}</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text color="gray">Node: {process.version}</Text>
                        <Text color="gray">Nox: v{NOX_VERSION}</Text>
                    </Box>
                </Box>
            </Box>
            
            <Box marginTop={1}>
                <Text italic color="gray">Need help? Visit https://github.com/Codeleafy/Nox/issues</Text>
            </Box>
        </Box>
    );
}
