import React from 'react';
import { Box, Text } from 'ink';
import { NOX_VERSION } from '../version.js';

export const Version = () => {
    return (
        <Box padding={1} borderStyle="single" borderColor="magenta">
            <Text bold color="white" backgroundColor="magenta"> NOX VERSION </Text>
            <Text>  v{NOX_VERSION}</Text>
        </Box>
    );
};
