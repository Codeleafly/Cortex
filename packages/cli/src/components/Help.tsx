import React from 'react';
import { Box, Text } from 'ink';

export const Help = () => {
    return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
            <Box marginBottom={1}>
                <Text bold color="white" backgroundColor="cyan"> NOX CLI </Text>
                <Text italic color="gray"> - The High-Performance AI-Native Programming Language</Text>
            </Box>

            <Box flexDirection="column" marginBottom={1}>
                <Text bold color="yellow">Usage:</Text>
                <Box marginLeft={2} flexDirection="column">
                    <Text>nox run <Text color="cyan">{"<file.nx>"}</Text> [flags] [args...]</Text>
                    <Text>nox repl                              Start the interactive REPL</Text>
                    <Text>nox version                           Show version info</Text>
                    <Text>nox help                              Show this help message</Text>
                </Box>
            </Box>

            <Box flexDirection="column" marginBottom={1}>
                <Text bold color="yellow">Permissions (Sandbox):</Text>
                <Box marginLeft={2} flexDirection="column">
                    <Box>
                        <Box width={15}><Text color="green">--allow-read</Text></Box>
                        <Text color="gray">Allow file read access</Text>
                    </Box>
                    <Box>
                        <Box width={15}><Text color="green">--allow-write</Text></Box>
                        <Text color="gray">Allow file write access</Text>
                    </Box>
                    <Box>
                        <Box width={15}><Text color="green">--allow-run</Text></Box>
                        <Text color="gray">Allow shell command execution</Text>
                    </Box>
                    <Box>
                        <Box width={15}><Text color="green">--allow-all</Text></Box>
                        <Text color="gray">Allow all permissions (DANGEROUS)</Text>
                    </Box>
                </Box>
            </Box>

            <Box flexDirection="column">
                <Text bold color="yellow">Modern Nox Syntax:</Text>
                <Box marginLeft={2} flexDirection="column">
                    <Text color="gray">is x = 10                  <Text italic>(Constant)</Text></Text>
                    <Text color="gray">mut y = 5                  <Text italic>(Variable)</Text></Text>
                    <Text color="gray">fn square(n) {"=>"} n * n      <Text italic>(Arrow Function)</Text></Text>
                    <Text color="gray">if x {">"} 5 {"{ print x }"}       <Text italic>(No Parentheses)</Text></Text>
                </Box>
            </Box>
        </Box>
    );
};
