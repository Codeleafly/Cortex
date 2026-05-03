import { describe, it, expect, vi } from 'vitest';
import { VM } from '../../packages/runtime/src/vm/VM';
import path from 'path';

describe('VULN-NEW-01: Sandbox Escape via Prefix Bug', () => {
    it('should NOT allow access to a sibling directory with a similar name', () => {
        // Mock CWD to something specific
        const mockCwd = '/home/user/Cortex';
        vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);

        const vm = new VM({ read: true }, false);
        
        // This path is OUTSIDE the sandbox but STARTS with the same prefix
        const maliciousPath = '/home/user/Cortex-secrets/passwords.txt';
        
        // Currently, this will pass because '/home/user/Cortex-secrets/passwords.txt'.startsWith('/home/user/Cortex') is true
        // We want it to THROW a Security Error.
        
        // Note: safeResolve is private, but it's called by READ_FILE opcode.
        // We can access it via (vm as any).safeResolve for direct testing or run bytecode.
        
        expect(() => (vm as any).safeResolve(maliciousPath)).toThrow(/Security Error: Sandbox escape attempt/);
    });
});
