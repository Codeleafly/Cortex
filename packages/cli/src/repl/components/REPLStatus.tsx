import React from 'react';
import { Box, Text } from 'ink';
import os from 'os';
import { NOX_VERSION } from '../../version.js';

export const REPLStatus = () => {
    return (
        <Box marginTop={1} borderStyle="classic" borderColor="gray" paddingX={1} justifyContent="space-between">
            <Box>
                <Text color="gray">nox-repl v{NOX_VERSION}</Text>
                <Text color="cyan"> @ </Text>
                <Text color="gray">{os.hostname()}</Text>
            </Box>
            <Box>
                <Text color="gray">Mode: </Text>
                <Text color="green" bold>SANDBOXED</Text>
                <Text color="gray"> | </Text>
                <Text color="cyan">.help</Text>
                <Text color="gray"> for commands</Text>
            </Box>
        </Box>
    );
};
