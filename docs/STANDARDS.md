# Nox Engineering Standards

## Coding Standards
- **Modern TypeScript:** Adhere to ESM and modern TypeScript best practices. Avoid outdated patterns.
- **Zero-Tolerance for `any`:** Use strict TypeScript typing. `any` is strictly prohibited.
- **Strict Mode:** TypeScript `strict` mode must be enabled and enforced.
- **Modular VM Architecture:** Keep opcode implementations separate from the main VM orchestration. Files should be small (< 200 lines) and focused.
- **Async-First Execution:** Prioritize asynchronous execution for any I/O, timers, or long-running tasks. Use `async/await` in TypeScript and `!` in Nox.

## Quality Standards
- **Modern Nox Syntax:** All new code and documentation MUST use the `is`/`mut` variables, `fn =>` arrows, and no-parens `if`/`while` syntax.
- **Test-Driven Development (TDD):** Every feature must have corresponding unit tests. Aim for high coverage in Lexer, Parser, and VM.
- **Clear Error Reporting:** Compiler/Interpreter errors must provide line/column numbers and helpful suggestions.
- **Documentation-as-Code:** Major architectural decisions and language features must be documented in the `/docs` folder.

For project-wide rules, see root [AGENTS.md](../AGENTS.md).
