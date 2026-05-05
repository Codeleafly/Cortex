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
    // Skills Mirroring (Kept as is)
    { src: 'skills', dest: '.gemini/skills' },
    { src: 'skills', dest: '.claude/skills' },
    { src: 'skills', dest: '.codex/skills' },
    { src: 'skills', dest: '.agents/skills' },
    { src: 'skills', dest: '.cursor/skills' },
    { src: 'skills', dest: '.opencode/skills' },

    // ❌ AGENTS MIRRORS REMOVED
];

function safeExists(filePath) {
    try {
        fs.lstatSync(filePath);
        return true;
    } catch {
        return false;
    }
}

async function createSymlink(srcName, destPath) {
    const fullSrc = path.join(root, srcName);
    const fullDest = path.join(root, destPath);
    const destDir = path.dirname(fullDest);

    if (!safeExists(fullSrc)) {
        console.warn(`⚠ Source missing, skipping: ${srcName}`);
        return;
    }

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    if (safeExists(fullDest)) {
        fs.rmSync(fullDest, { recursive: true, force: true });
    }

    const isDir = fs.statSync(fullSrc).isDirectory();
    const type = process.platform === 'win32' && isDir ? 'junction' : 'file';

    try {
        const relativeSrc = path.relative(destDir, fullSrc);
        await fs.promises.symlink(relativeSrc, fullDest, type);
        console.log(`✔ ${destPath} → ${srcName}`);
    } catch (err) {
        console.error(`✖ Failed ${destPath}:`, err.message);
    }
}

async function main() {
    try {
        const { execSync } = await import('node:child_process');
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

        if (branch === 'main') {
            console.error('Blocked: main branch protected');
            process.exit(1);
        }
    } catch {}

    console.log('\n🚀 Sync Starting (Agents Mirror Disabled)...\n');

    for (const link of fileLinks) {
        await createSymlink(link.src, link.dest);
    }

    for (const link of folderLinks) {
        await createSymlink(link.src, link.dest);
    }

    console.log('\n✅ Sync Complete');
}

main().catch(console.error);