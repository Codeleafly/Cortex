# Cortex AI Contributions Log

This file is a mandatory, permanent ledger for all AI agents contributing to the Cortex project. Every agent MUST document their identity, the specific tasks they performed, and the technical rationale behind their decisions.

---

## [2026-05-01] Log Entry 1: Project Bootstrapping & Core Engine Evolution
**Agent Identity:** Gemini CLI (LLM-based CLI Agent)

### 1. User Request & Context
The user requested the creation of a new programming language named **Cortex** from scratch using TypeScript. Key requirements included:
- Python-like simplicity with JavaScript-like structural syntax (Hybrid).
- High-performance numeric bytecode execution (no heavy AST interpretation).
- A stack-based Virtual Machine (VM).
- A modern, beginner-friendly CLI/REPL built with the `ink` library.
- Strict AI-first governance and branding.

### 2. Technical Implementation Details
- **Architecture:** I chose a "one-pass" compilation model. The `Compiler` class tokenizes the source and emits `Int32Array` opcodes directly. This maximizes memory locality and execution speed.
- **VM Design:** Implemented a stack-based VM using a `switch-case` dispatcher over numeric opcodes. Added a `callStack` to support functions and scoped memory for variables.
- **Syntax Features:**
  - Implemented `let` declarations and assignment statements.
  - Added support for Strings (with a String Pool in the VM), Booleans, and Null.
  - Added logical (`&&`, `||`, `!`) and comparison (`>`, `<`, `==`) operators.
  - Added function support with the `fn` keyword and parameter handling.
  - Added support for single-line (`//`) and multi-line (`/* */`) comments.
- **REPL:** Developed a React-based CLI using `ink` and `ink-text-input`. Added logic to detect incomplete code blocks for natural multi-line input support.

### 3. Key Bug Fixes & Refinements
- **Infinite Loop Fix:** Identified that using `let` inside loops created new scoped variables, preventing loop counters from updating. Introduced explicit assignment support (`x = x - 1`) to resolve this and allow mutable state updates.
- **Global Binary:** Configured `package.json` with a `bin` entry and added a shebang to `index.ts` to enable the global `cortex` command.

### 4. Documentation & Branding
- Established `GEMINI.md` and `AGENTS.md` as mirrored rule files.
- Created modular documentation in `docs/` covering syntax, CLI, and architecture.
- Applied an MIT License with a Developmental Control Notice reserving control for AI agents.

**Status:** Initial Baseline Version 1.0.0 Complete.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 2: Transparency Audit & Rule Formalization
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user requested a full audit of all project files to ensure consistency and the creation of a mandatory AI transparency log (`AGENTS_LOG.md`). Branding and licensing were also finalized.

### 2. Technical Implementation Details
- **Rule Enforcement:** Updated `GEMINI.md` and `AGENTS.md` to include mandatory rules for AI identification and activity logging.
- **Documentation Audit:** Synchronized `docs/syntax.md`, `docs/cli.md`, and `README.md` with the final engine state. Specifically, verified that the assignment syntax (`x = 20`) is used instead of redeclaration in loop examples.
- **Project Structure:** Verified modularity of `docs/` and ensured all `.ctx` test files in `tests/ctx/` are functional.
- **Licensing:** Finalized the MIT License with a "Developmental Control Notice" reserving core authority for AI agents.

### 3. Final Verification
- Performed a clean build (`npm run build`).
- Verified all 6 integration tests via `npm run test` and manual CLI execution.
- Confirmed that the REPL's multi-line detection works for complex blocks.

**Status:** Project Governance & Documentation Audit Complete. Ready for Production.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 3: Monorepo Restructuring & Modern ESM Migration
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user requested a massive architectural pivot: moving away from a single-file engine into a deeply nested, professional monorepo structure. The user also explicitly mandated avoiding "old" patterns, forcing a fully modern ESM approach.

### 2. Technical Implementation Details
- **NPM Workspaces Setup:** Configured a root `package.json` to manage workspaces and centralized devDependencies.
- **Deep Decoupling:** Split the core engine into four distinct packages:
  - `@cortex/shared`: `Opcode` and `TokenType` definitions.
  - `@cortex/frontend`: `Lexer` and `Compiler` components.
  - `@cortex/runtime`: The `VM` responsible for executing bytecode.
  - `@cortex/cli`: The Ink-based REPL and executable entry point.
- **Modern ESM Configuration:** Eliminated legacy `main` and `types` patterns in favor of modern `exports` mapping in every `package.json`.
- **TypeScript Project References:** Created a `tsconfig.base.json` and utilized composite project references (`tsc -b`) to build the entire monorepo top-down flawlessly.
- **Dependency Conflict Resolution:** Modernized dependency constraints (e.g., `ink@^5.0.0` and `ink-text-input@^6.0.0`) to natively resolve peer dependency trees.

### 3. Final Verification
- Compiled the entire monorepo successfully via `tsc -b`.
- Relocated and verified all 6 integration tests via `npm run test` inside the CLI workspace.

**Status:** Monorepo Architecture Complete.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 4: Real-World Challenge Protocol & CLI Calculator
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user introduced the "Real-World Challenge Protocol", mandating that AI must accept complex challenges to build practical applications in Cortex, adding any missing language features to succeed. The first challenge was to build a CLI Calculator that uses command-line flags. The user also mandated that `CLAUDE.md` be created alongside `GEMINI.md` and `AGENTS.md` as an identical rules mirror.

### 2. Technical Implementation Details
- **Rule Enforcement:** Updated `GEMINI.md`, `AGENTS.md`, and `CONTRIBUTING.md` to mandate the Challenge Protocol. Created `CLAUDE.md` as a mirror.
- **Engine Upgrades (Phase 2):** To parse CLI arguments, I introduced three new language primitives:
  - `arg_count`: A token/opcode that pushes the length of the arguments array.
  - `get_arg(index)`: A token/opcode that pushes a specific argument string onto the stack.
  - `to_number(string)`: A token/opcode that parses a string into an integer.
- **Compiler & VM Integration:** Updated the `@cortex/frontend` Lexer and Compiler to parse these new primitives, and updated the `@cortex/runtime` VM to execute them natively by receiving `args` array via the `run()` method.
- **CLI Workspace:** Updated `@cortex/cli` to slice `process.argv` and pass the arguments into the Virtual Machine.
- **Challenge Implementation:** Created `tests/real_world_tests/01_cli_calculator/calc.ctx` utilizing the new language primitives to check flags (`--add`, `--sub`, `--mul`, `--div`) and process operands.

### 3. Final Verification
- Executed `node packages/cli/dist/index.js tests/real_world_tests/01_cli_calculator/calc.ctx --add 10 5` and successfully received the calculated output: `15`.

**Status:** Challenge #1 (CLI Calculator) Complete & Engine Upgraded.
**Author:** Gemini CLI
