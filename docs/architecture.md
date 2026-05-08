# Nox Architecture (v1.0.1 Blueprint)

Nox is a programming language built from scratch in Rust, designed for high performance, distribution, and a "toy-to-pro" developer experience.

## Core Decisions
- **Monorepo Structure:** Isolated Cargo crates: `shared`, `frontend`, `runtime`, `cli`.
- **Hybrid Syntax:** Default Mode (natural keywords like `say`/`ask`) and Strict Mode (`!strict`, explicit types).
- **64-bit VM:** Numeric bytecode execution (`Vec<i64>`) on a stack-based architecture.
- **Deno-Style Modularity:** URL-based imports with a global deduplicated cache (`$HOME/.nox_libx/`).
- **Sandbox Security:** Capability-based permissions (`--allow-read`, etc.) and path-based whitelisting.

## Package Layout
- `packages/frontend`: Recursive-descent Parser and AST-to-Bytecode Compiler.
- `packages/runtime`: Modular VM with async support (Tokio).
- `packages/shared`: Contract of numeric Opcodes and Tokens.
- `packages/cli`: `rustyline`-powered REPL and script runner.

## VM Technical Specifications
- **Operand Stack:** 1024 slots.
- **Global Memory:** 512 slots.
- **Local Memory:** 1024 slots (frame-relative addressing via `bp`).
- **Safety:** Automatic bounds checking, stack restoration on `RET`, and path resolution isolation.

For syntax details, see [docs/syntax.md](syntax.md).
For CLI usage, see [docs/cli.md](cli.md).
