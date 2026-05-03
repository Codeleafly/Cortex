
import { describe, it, expect, vi } from 'vitest';
import { VM } from '../../packages/runtime/src/vm/VM';
import path from 'path';
import fs from 'fs';

describe('VULN-08: Symlink Sandbox Escape', () => {
    it('should NOT allow access through a symlink to outside', () => {
        const root = path.resolve('./tests/tmp_sandbox');
        if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
        
        const outsideFile = path.resolve('./tests/outside.txt');
        fs.writeFileSync(outsideFile, 'secret content');
        
        const symlinkPath = path.join(root, 'link_outside');
        if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
        
        try {
            fs.symlinkSync(outsideFile, symlinkPath);
        } catch (e) {
            // Symlinks might require admin on Windows, skip if failed
            return;
        }

        const vm = new VM({ read: true }, false);
        vi.spyOn(process, 'cwd').mockReturnValue(root);

        // Accessing the symlink directly
        expect(() => (vm as any).safeResolve('link_outside')).toThrow(/Security Error: Sandbox escape attempt/);

        // Accessing a path THROUGH a symlink prefix
        expect(() => (vm as any).safeResolve('link_outside/newfile.txt')).toThrow(/Security Error: Sandbox escape attempt/);

        // Cleanup
        fs.unlinkSync(symlinkPath);
        fs.unlinkSync(outsideFile);
        fs.rmdirSync(root);
    });
});
