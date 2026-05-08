# Nox Engineering Standards

## Coding Standards
- **Idiomatic Rust:** Adhere to modern Rust best practices (e.g., using `Result`/`Option` over panics where possible, clear lifetimes).
- **Strict Typing:** Rust's strong type system must be utilized. Avoid overly generic `Any` equivalents unless strictly necessary.
- **Zero-Tolerance for Warnings:** The codebase must compile with absolutely zero warnings (`cargo check` must be clean).
- **Modular VM Architecture:** Keep opcode implementations separate from the main VM orchestration. Files should be small (< 200 lines) and focused.
- **Async-First Execution:** Prioritize asynchronous execution for any I/O, timers, or long-running tasks. Use `tokio` for async operations.

## Quality Standards
- **Modern Nox Syntax:** All new code and documentation MUST use the `is`/`mut` variables, `fn =>` arrows, and no-parens `if`/`while` syntax.
- **Test-Driven Development (TDD):** Every feature must have corresponding unit tests. Aim for high coverage in Lexer, Parser, and VM.
- **Clear Error Reporting:** Compiler/Interpreter errors must provide helpful suggestions.
- **Documentation-as-Code:** Major architectural decisions and language features must be documented in the `/docs` folder.

For project-wide rules, see root [AGENTS.md](../AGENTS.md).
