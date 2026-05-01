# Cortex Project Guidelines

## Project Overview
- **Name:** Cortex
- **Type:** A programming language built completely from scratch.
- **Technology Stack:** TypeScript, Node.js (ESM), following modern standards.

## Development Principles
- **AI-First Development:** This project is primarily developed, reviewed, and managed using Gemini CLI and other AI agents. AI is responsible for coding, reviewing PRs, and proactively creating issues.
- **Human Documentation:** Humans can participate in development and oversight, but any human-authored changes or manual interventions **MUST be explicitly documented** in code comments or documentation files.
- **Full Implementation:** Aim for complete, working solutions rather than placeholders or partial implementations.
- **Contribution Standards:** All development must strictly follow the guidelines in `CONTRIBUTING.md`.

## Mandatory Workflow
- **Plan First:** Before starting any task, you **MUST** enter Plan Mode using the `enter_plan_mode` tool.
- **Research & Strategy:** Always perform thorough research and define a strategy before writing code. **You must read all relevant files (`.ts`, `.txt`, `.md`, `.ctx`) to fully understand the context.**
- **Verification:** It is compulsory to run `npm run build` to verify that your changes haven't broken the build.
- **Documentation & Rules:** Keep `.md` files, documentation, and these rules updated whenever core changes or significant updates are made. **AGENTS.md and GEMINI.md must always be kept as identical mirrors.**
- **Standards:** Adhere to ESM and modern TypeScript best practices. Avoid outdated patterns.

## Architecture & Quality Standards
- **Bytecode-First:** Cortex must prioritize numeric bytecode execution over AST interpretation for maximum performance.
- **Test-Driven Development (TDD):** Every language feature (tokens, syntax, built-ins) must have corresponding unit tests. Aim for high coverage in Lexer and Parser.
- **Clear Error Reporting:** Compiler/Interpreter errors must provide line/column numbers and helpful suggestions, not just stack traces.
- **Strict Separation of Concerns:** Lexer, Parser, and Evaluator/Interpreter must be strictly decoupled.
- **Zero-Tolerance for `any`:** Use strict TypeScript typing. Avoid `any` to prevent runtime bugs in the compiler.
- **Documentation-as-Code:** Document major architectural decisions and language features in the `/docs` folder or relevant `.md` files.
