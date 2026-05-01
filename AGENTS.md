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
- **AI Agent Identification:** Any AI agent making changes or updates **MUST** explicitly state its name (e.g., "Developed by Gemini CLI") in commit messages or documentation updates.
- **Mandatory AI Logging:** Every AI agent **MUST** append a detailed entry to `AGENTS_LOG.md` documenting their identity, the user's prompt context, and the technical implementation details of their work.
- **Documentation & Rules:** Keep `.md` files, documentation, and these rules updated whenever core changes or significant updates are made. **AGENTS.md, GEMINI.md, and CLAUDE.md must always be kept as identical mirrors.**
- **Real-World Challenge Protocol:** Users can issue complex challenges to build real applications in Cortex. The AI **MUST** accept the challenge, create a dedicated folder inside `tests/real_world_tests/<challenge_name>`, and work iteratively—adding any necessary language features—until the challenge is 100% successfully completed.
- **Standards:** Adhere to ESM and modern TypeScript best practices. Avoid outdated patterns.

## Architecture & Quality Standards
- **Monorepo Structure:** The project MUST follow a professional, scalable monorepo architecture. Code must be divided into distinct workspaces under a `packages/` directory (e.g., `packages/frontend` for Lexer/Parser/Compiler, `packages/runtime` for the VM, `packages/cli` for the REPL). Deeply nested, modular folders are required.
- **Bytecode-First:** Cortex must prioritize numeric bytecode execution over AST interpretation for maximum performance.
- **Test-Driven Development (TDD):** Every language feature (tokens, syntax, built-ins) must have corresponding unit tests. Aim for high coverage in Lexer and Parser.
- **Clear Error Reporting:** Compiler/Interpreter errors must provide line/column numbers and helpful suggestions, not just stack traces.
- **Strict Separation of Concerns:** Lexer, Compiler, and VM must be strictly decoupled into their respective packages.
- **Zero-Tolerance for `any`:** Use strict TypeScript typing. Avoid `any` to prevent runtime bugs in the compiler.
- **Documentation-as-Code:** Document major architectural decisions and language features in the `/docs` folder or relevant `.md` files.