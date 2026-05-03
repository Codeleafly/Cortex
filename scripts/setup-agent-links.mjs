import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const fileLinks = [
    { src: 'AGENTS.md', dest: 'GEMINI.md' },
    { src: 'AGENTS.md', dest: 'CLAUDE.md' },
    { src: 'AGENTS.md', dest: 'CODEX.md' },
    { src: 'AGENTS.md', dest: 'OPENCODE.md' },
    { src: 'AGENTS.md', dest: '.cursorrules' },
    { src: 'AGENTS.md', dest: '.claude/CLAUDE.md' },
    { src: 'AGENTS.md', dest: '.agents/AGENTS.md' },
    { src: 'AGENTS.md', dest: '.codex/CODEX.md' },
];

const folderLinks = [
    { src: 'skills', dest: '.gemini/skills' },
    { src: 'skills', dest: '.claude/skills' },
    { src: 'skills', dest: '.codex/skills' },
    { src: 'skills', dest: '.agents/skills' },
    { src: 'skills', dest: '.cursor/skills' },
    { src: 'skills', dest: '.opencode/skills' },
];

async function createSymlink(srcName, destPath) {
    const fullSrc = path.join(root, srcName);
    const fullDest = path.join(root, destPath);
    const destDir = path.dirname(fullDest);

    // Create parent directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
        console.log(`Creating directory: ${destDir}`);
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Remove existing if it's a file or symlink
    if (fs.existsSync(fullDest) || fs.lstatSync(fullDest, { throwIfNoEntry: false })) {
        console.log(`Removing existing: ${destPath}`);
        fs.rmSync(fullDest, { recursive: true, force: true });
    }

    const isDir = fs.statSync(fullSrc).isDirectory();
    const type = process.platform === 'win32' && isDir ? 'junction' : 'file';

    try {
        // We use relative paths for symlinks to keep them portable
        const relativeSrc = path.relative(destDir, fullSrc);
        await fs.promises.symlink(relativeSrc, fullDest, type);
        console.log(`Created symlink: ${destPath} -> ${srcName}`);
    } catch (err) {
        console.error(`Failed to create symlink ${destPath}:`, err.message);
    }
}

async function main() {
    // Policy enforcement: Ensure we are not on the main branch per Mandate 16
    try {
        const { execSync } = await import('node:child_process');
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        if (branch === 'main') {
            console.error('Error: Direct development on main branch is prohibited by Mandate 16.');
            process.exit(1);
        }
    } catch (e) {
        // Ignore if git is not available or not a git repo
    }

    console.log('--- Setting up Agent Compatibility Symlinks ---');
    
    for (const link of fileLinks) {
        await createSymlink(link.src, link.dest);
    }

    for (const link of folderLinks) {
        await createSymlink(link.src, link.dest);
    }

    console.log('--- Setup Complete ---');
}

main().catch(console.error);
// Policy enforcement trigger
