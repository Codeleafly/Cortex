# Cortex Architecture

Cortex is a programming language built from scratch in TypeScript, designed for high performance and AI-first development.

## Core Decisions
- **Monorepo Structure:** The project follows a professional monorepo architecture. Code is divided into isolated packages under `packages/` (`shared`, `frontend`, `runtime`, `cli`).
- **Bytecode-First:** Cortex prioritizes numeric bytecode execution (`Int32Array`) over AST interpretation for maximum performance.
- **Strict Separation of Concerns:** Lexer, Parser, Compiler, and VM are strictly decoupled into their respective packages.
- **One-Pass Compilation:** The compiler translates source code directly into numeric opcodes in a single pass.

## Package Layout
- `packages/frontend`: Lexer and Parser for hybrid JS/Python syntax.
- `packages/runtime`: Stack-based Virtual Machine (VM).
- `packages/shared`: Common types, tokens, and opcodes.
- `packages/cli`: Interactive Ink-based REPL and executable entry point.

For syntax details, see [syntax.md](syntax.md).
For CLI usage, see [cli.md](cli.md).
