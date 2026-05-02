# Cortex Architecture

Cortex is a programming language built from scratch in TypeScript, designed for high performance and AI-first development.

## Core Decisions
- **Monorepo Structure:** The project follows a professional monorepo architecture. Code is divided into isolated packages under `packages/` (`shared`, `frontend`, `runtime`, `cli`).
- **Bytecode-First:** Cortex prioritizes numeric bytecode execution (`Int32Array`) over AST interpretation for maximum performance.
- **Strict Separation of Concerns:** Lexer, Parser, Compiler, and VM are strictly decoupled into their respective packages.
- **Two-Stage Frontend:** The language uses a formal Parser and Abstract Syntax Tree (AST) stage between the Lexer and Compiler. This allows for complex optimizations and better semantic analysis.
- **AST-to-Bytecode:** The compiler walks the AST to generate numeric opcodes, maintaining a decoupling between syntax and execution.

## Package Layout
- `packages/frontend`: Lexer and Parser for hybrid JS/Python syntax.
- `packages/runtime`: Stack-based Virtual Machine (VM).
- `packages/shared`: Common types, tokens, and opcodes.
- `packages/cli`: Interactive Ink-based REPL and executable entry point.

For syntax details, see [syntax.md](syntax.md).
For CLI usage, see [cli.md](cli.md).
