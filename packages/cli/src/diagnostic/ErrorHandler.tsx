import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import os from 'os';

interface ErrorDiagnosticProps {
    error: Error | any;
    sourceCode?: string;
    filePath?: string;
}

export function ErrorDiagnostic({ error, sourceCode, filePath }: ErrorDiagnosticProps) {
    // Attempt to extract line number from error message if available
    let lineNum: number | null = null;
    const lineMatch = error.message?.match(/line\s+(\d+)/i);
    if (lineMatch) {
        lineNum = parseInt(lineMatch[1], 10);
    } else if (error.line) {
        lineNum = error.line;
    }

    let snippet: React.ReactNode = null;

    if (lineNum !== null && sourceCode) {
        const lines = sourceCode.split('\n');
        const startLine = Math.max(0, lineNum - 6);
        const endLine = Math.min(lines.length - 1, lineNum + 3);
        
        const snippetLines = [];
        for (let i = startLine; i <= endLine; i++) {
            const isErrorLine = i === lineNum - 1;
            const linePrefix = isErrorLine ? chalk.bgRed.whiteBright(` ${i + 1} | `) : chalk.gray(` ${i + 1} | `);
            const lineContent = isErrorLine ? chalk.red(lines[i]) : chalk.white(lines[i]);
            snippetLines.push(
                <Box key={i}>
                    <Text>{linePrefix}{lineContent}</Text>
                </Box>
            );
            if (isErrorLine) {
                // Add a squiggly line underneath
                snippetLines.push(
                    <Box key={`squiggly-${i}`}>
                        <Text>{chalk.bgRed.whiteBright('   | ')} {chalk.red('^'.repeat(Math.max(1, lines[i].length)))}</Text>
                    </Box>
                );
            }
        }
        snippet = <Box flexDirection="column" marginY={1} paddingX={1} borderStyle="single" borderColor="red">{snippetLines}</Box>;
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box>
                <Text bold backgroundColor="red" color="white"> X NOX ERROR </Text>
                <Text color="red">  {error.name || 'Error'}: {error.message}</Text>
            </Box>

            {filePath && (
                <Box marginTop={1}>
                    <Text color="gray">File: {filePath}{lineNum ? `:${lineNum}` : ''}</Text>
                </Box>
            )}

            {snippet}

            <Box marginTop={1} padding={1} borderStyle="round" borderColor="gray" flexDirection="column">
                <Text color="gray">--- Diagnostic Metadata ---</Text>
                <Text color="gray">OS: {os.type()} {os.release()} ({os.arch()})</Text>
                <Text color="gray">Node Version: {process.version}</Text>
                <Text color="gray">Nox Runtime Build: v1.0.0</Text>
            </Box>
        </Box>
    );
}
