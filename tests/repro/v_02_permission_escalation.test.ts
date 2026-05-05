import { describe, it, expect, vi } from 'vitest';
import { VM } from '../../packages/runtime/src/vm/VM';
import readline from 'readline-sync';

describe('VULN-NEW-02: Permanent Permission Escalation', () => {
    it('should NOT grant global permission after a single file access is approved', () => {
        const vm = new VM({ read: false }, true);
        
        // Mock readline
        const questionSpy = vi.spyOn(readline, 'question')
            .mockReturnValueOnce('y') // Allow fileA
            .mockReturnValueOnce('n'); // Deny fileB

        // First access to file A
        vm.state.checkPermission('read', 'fileA.txt');
        
        // Second access to file B should prompt again and throw because we return 'n'
        expect(() => vm.state.checkPermission('read', 'fileB.txt')).toThrow(/Security Error/);
        
        expect(questionSpy).toHaveBeenCalledTimes(2);
    });
});
