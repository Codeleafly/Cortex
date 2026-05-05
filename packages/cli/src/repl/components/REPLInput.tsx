import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface REPLInputProps {
    input: string;
    setInput: (val: string) => void;
    onSubmit: (val: string) => void;
    isMultiline: boolean;
}

export const REPLInput = ({ input, setInput, onSubmit, isMultiline }: REPLInputProps) => {
    return (
        <Box marginTop={1}>
            <Text color="cyan" bold>{isMultiline ? '... ' : '› '}</Text>
            <TextInput 
                value={input} 
                onChange={setInput} 
                onSubmit={onSubmit} 
            />
        </Box>
    );
};
