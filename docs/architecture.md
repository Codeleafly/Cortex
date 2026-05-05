# Nox Architecture

Nox is a programming language built from scratch in TypeScript, designed for high performance and AI-first development.

## Core Decisions
- **Monorepo Structure:** The project follows a professional monorepo architecture. Code is divided into isolated packages under `packages/` (`shared`, `frontend`, `runtime`, `cli`).
- **Bytecode-First:** Nox prioritizes numeric bytecode execution (`Int32Array`) over AST interpretation for maximum performance.
- **Strict Separation of Concerns:** Lexer, Parser, Compiler, and VM are strictly decoupled into their respective packages.
- **Two-Stage Frontend:** The language uses a formal Parser and Abstract Syntax Tree (AST) stage between the Lexer and Compiler. This allows for complex optimizations and better semantic analysis.
- **AST-to-Bytecode:** The compiler walks the AST to generate numeric opcodes, maintaining a decoupling between syntax and execution.

## Package Layout
- `packages/frontend`: Lexer and Parser for hybrid JS/Python syntax.
- `packages/runtime`: Stack-based Virtual Machine (VM).
- `packages/shared`: Common types, tokens, and opcodes.
- `packages/cli`: Interactive Ink-based REPL and executable entry point.

## VM Technical Specifications
- **Operand Stack:** 1024 slots (StackValue union).
- **Call Stack:** 256 frames (for return addresses and base pointers).
- **Global Memory:** 512 slots (isolated global storage).
- **Local Memory Stack:** 1024 slots (dedicated to function frames).
- **Addressing:**
  - **Local:** Frame-relative addressing via Base Pointer (`bp`).
  - **Global:** Absolute addressing in the dedicated globals segment.
- **Modularity:** 
  - **Modular VM Architecture:** Opcodes are isolated into logical modules (math, I/O, async, core) to maintain codebase cleanliness and prevent "God Objects".
  - **True Async Model:** The VM supports non-blocking execution of async opcodes using `async/await` and an internal promise-tracking mechanism.
- **Safety Features:** 
  - Mandatory bounds checking for all memory and bytecode access.
  - Stack overflow/underflow protection.
  - Isolated memory segments to prevent state corruption.
  - Typed numeric bytecode execution via `Int32Array`.

For syntax details, see [syntax.md](syntax.md).
For CLI usage, see [cli.md](cli.md).
