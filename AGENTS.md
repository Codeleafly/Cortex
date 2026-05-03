# Cortex AI Agents Configuration

Cortex is a high-performance, general-purpose programming language built from scratch in TypeScript, designed to be developed and managed primarily by AI agents.

## Project Context
- **Project Goal:** Build a highly efficient, bytecode-based language with a hybrid JS/Python syntax.
- **Tech Stack:** TypeScript (Strict), Node.js (ESM), Vitest, React/Ink (CLI).
- **Monorepo Structure:** Managed via npm workspaces under `packages/*`.
- **Primary Commands:** 
  - `npm run build`: Compiles all packages using `tsc -b`.
  - `npm run test`: Runs all integration and unit tests.
  - `cortex`: Starts the interactive Ink-based REPL.

## Core Mandates (Mandatory for all AI Agents)
1. **Plan First:** Always enter Plan Mode and get user approval before modifying code.
2. **AI Identification:** State your agent name in every major commit, PR, and documentation update.
3. **Transparency Logging:** Document technical details, rationale, and user directives in `AGENTS_LOGS/<Agent_Name>/AGENTS_LOGS.md` following the standards in `AGENTS_LOGS_RULE.md`.
4. **Mandatory Rule Maintenance:** AI agents MUST update `AGENTS.md`, `AGENTS_LOGS_RULE.md`, and related modular documentation whenever core rules, project structure, or workflows change.
5. **Zero-Tolerance for `any`:** Strict TypeScript typing is required. `any` is strictly prohibited.
6. **Bytecode-First:** Prioritize numeric `Int32Array` bytecode and a stack-based VM for maximum performance.
7. **Verification Loop:** It is **compulsory** to run `npm run build` and execute all `.ctx` integration tests after every update.
8. **Real-World Challenge Protocol:** Accept complex user challenges, create dedicated folders in `tests/real_world_tests/`, and iterate until 100% success.
9. **Bug Hunting Expert:** Proactively audit the engine for subtle logic bugs (precedence, scope, memory leaks). When a bug is found, create a reproduction script before fixing.
10. **Official Skills Standardization:** All new skills MUST follow the [Agent Skills Standard](https://agentskills.io), including full YAML frontmatter and documentation-first structure.
11. **Bug Reporting Protocol:** When a bug is identified, the AI agent MUST create (or update) a `Bug.md` file in the root directory. This file serves as the official ledger of vulnerabilities and fixes, following the verified audit format (ID, Name, Status, Verification).
12. **Human Participation Disclosure:** Any human-authored code or manual intervention MUST be explicitly documented.
13. **Zero-Litter Policy:** AI agents MUST NOT create temporary, reproduction, or garbage files in the root directory. All such files MUST reside within the `tests/` directory or package-specific subdirectories to maintain workspace cleanliness.
14. **Git Protocol Integrity:** AI agents MUST NEVER use `git push --force` or overwrite remote history unless explicitly directed by the user. Always prioritize `git pull` and manual conflict resolution to preserve the collaborative audit trail.
15. **Multi-Agent Compatibility Layer:** AI agents MUST maintain cross-platform symlinks for instruction files and skills to support various AI interfaces (Gemini, Claude, Codex, etc.). This ensures that any agent accessing the repository can find its specific instructions and shared capabilities. Use the `scripts/setup-agent-links.mjs` script to maintain these links.
16. **Branch Safety Protocol:** AI agents MUST check `git status` at the beginning of any task to ensure they are not working directly on the `main` branch. If the current branch is `main`, the agent MUST create a new feature or fix branch (e.g., `feat/...` or `fix/...`) before making any modifications. Direct development on `main` is strictly prohibited to maintain repository integrity.

## Progressive Disclosure
For detailed rules, architectural deep-dives, and coding patterns, refer to:
- [Cortex Architecture](docs/architecture.md): Bytecode design, VM internals, and monorepo decoupling.
- [AI Development Workflow](docs/WORKFLOW.md): Detailed planning, research, and verification protocols.
- [Engineering Standards](docs/STANDARDS.md): TDD requirements, error reporting, and styling.
- [Syntax Guide](docs/syntax.md): Comprehensive hybrid JS/Python syntax documentation.
- [Agent Skills](docs/SKILLS.md): Standardized capabilities for repository-specific workflows.

## Agent Skills
This repository supports **Agent Skills**, a lightweight format for extending AI agent capabilities.
- **Discovery:** Skills are located in the `packages/cli/builtin-skills/` or a global `skills/` directory.
- **Activation:** Use specialized skills to handle complex procedures like adding new Opcodes or refactoring VM logic.
- **Creation:** Agents should create new skills for repeatable, high-stakes workflows following the [Best Practices](docs/SKILLS.md).

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branching and security guidelines.
Refer to [AGENTS_LOGS/](AGENTS_LOGS/) for the decentralized AI contribution history.
