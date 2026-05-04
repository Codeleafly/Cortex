# Nox Engineering Standards

## Coding Standards
- **Modern TypeScript:** Adhere to ESM and modern TypeScript best practices. Avoid outdated patterns.
- **Zero-Tolerance for `any`:** Use strict TypeScript typing. `any` is strictly prohibited.
- **Strict Mode:** TypeScript `strict` mode must be enabled and enforced.

## Quality Standards
- **Test-Driven Development (TDD):** Every feature must have corresponding unit tests. Aim for high coverage in Lexer and Parser.
- **Clear Error Reporting:** Compiler/Interpreter errors must provide line/column numbers and helpful suggestions.
- **Documentation-as-Code:** Major architectural decisions and language features must be documented in the `/docs` folder.

For project-wide rules, see root [AGENTS.md](../AGENTS.md).
