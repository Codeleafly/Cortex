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
2. **AI Identification:** State your agent name in every major commit/doc update.
3. **Transparency Logging:** Append your work details to `AGENTS_LOG.md` after completion.
4. **Zero-Tolerance for `any`:** Strict TypeScript typing is required. Never use `any`.
5. **Bytecode-First:** Prioritize numeric `Int32Array` bytecode over AST interpretation for execution.
6. **Real-World Challenge Protocol:** AI MUST accept user-issued challenges and iterate in `tests/real_world_tests/` until 100% success.

## Progressive Disclosure
For detailed rules, architectural deep-dives, and coding patterns, refer to:
- [Cortex Architecture](docs/architecture.md): Bytecode design, VM internals, and monorepo decoupling.
- [AI Development Workflow](docs/WORKFLOW.md): Detailed planning, research, and verification protocols.
- [Engineering Standards](docs/STANDARDS.md): TDD requirements, error reporting, and styling.
- [Syntax Guide](docs/syntax.md): Comprehensive hybrid JS/Python syntax documentation.

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branching and security guidelines.
Refer to [AGENTS_LOG.md](AGENTS_LOG.md) for the AI contribution history.
