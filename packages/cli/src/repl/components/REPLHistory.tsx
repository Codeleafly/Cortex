import React from 'react';
import { Box, Text, Static } from 'ink';
import chalk from 'chalk';
import { highlight } from '../utils/highlighter.js';

export interface HistoryItem {
    id: string;
    type: 'input' | 'output' | 'error' | 'info';
    text: string;
    isContinuation?: boolean;
}

interface REPLHistoryProps {
    history: HistoryItem[];
}

export const REPLHistory = ({ history }: REPLHistoryProps) => {
    return (
        <Static items={history}>
            {(item) => (
                <Box key={item.id} flexDirection="column" marginBottom={item.type === 'error' || item.type === 'info' ? 1 : 0}>
                    {item.type === 'input' && (
                        <Box>
                            <Text color="cyan" bold>{item.isContinuation ? '... ' : '› '} </Text>
                            <Text>{highlight(item.text)}</Text>
                        </Box>
                    )}
                    {item.type === 'output' && (
                        <Box paddingLeft={2}>
                            <Text color="green">⬎ {item.text}</Text>
                        </Box>
                    )}
                    {item.type === 'error' && (
                        <Box paddingX={1} borderStyle="round" borderColor="red" flexDirection="column">
                            <Text color="red" bold>REPL Error:</Text>
                            <Text color="red">{item.text}</Text>
                        </Box>
                    )}
                    {item.type === 'info' && (
                        <Box paddingX={1} borderStyle="double" borderColor="yellow">
                            <Text color="yellow" bold>Nox Info: </Text>
                            <Text color="white">{item.text}</Text>
                        </Box>
                    )}
                </Box>
            )}
        </Static>
    );
};
