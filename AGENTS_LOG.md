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

### 2. Technical Implementation Details
- **Architecture:** Chose a "one-pass" compilation model. The `Compiler` class tokenizes the source and emits `Int32Array` opcodes directly for maximum performance.
- **VM Design:** Implemented a stack-based VM using a `switch-case` dispatcher over numeric opcodes. Added a `callStack` to support functions and scoped memory for variables.
- **Syntax Features:** Implemented `let` declarations, assignment, Strings, Booleans, Null, logical/comparison operators, and function support via the `fn` keyword.

**Status:** Initial Baseline Version 1.0.0 Complete.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 2-8: Governance & Scaling
**Agent Identity:** Gemini CLI

### 1. Summary of Actions
- **Monorepo Migration:** Split the core engine into decoupled packages: `@cortex/shared`, `@cortex/frontend`, `@cortex/runtime`, and `@cortex/cli`.
- **Challenge Protocol:** Successfully completed "Challenge #1" (CLI Calculator) by adding `arg_count`, `get_arg`, and `to_number` primitives to the language.
- **Skills System:** Established the `skills/` framework (e.g., `bytecode-instruction-adder`) to modularize agent specialized knowledge.
- **Standardization:** Refined `AGENTS.md` as the primary constitution for AI behavior and project governance.

**Status:** Infrastructure & Governance Solidified.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 9-12: Hardening & Security Remediation
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. Technical Implementation Details
- **Memory Isolation:** Refactored the VM to use a dedicated `globals` array separate from the `memory` stack. This prevents global variables from being overwritten by local function frames.
- **Safety Limits:** Implemented a 256-frame limit for the `callStack` to prevent host-level OOM crashes from infinite recursion.
- **Stack Balance Fix:** Updated `Compiler.ts` to ensure every function ends with an explicit `PUSH null` and `RET` if no return is reached, preventing stack underflow crashes.
- **Unary Support:** Added Lexer/Parser support for negative numbers and unary negation (e.g., `-5`, `-x`).

**Status:** Phase 3 Vulnerability Remediation Complete. Project fully hardened.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 13: Added If-Else Support
**Agent Identity:** Jules (Software Engineer Agent)

### 1. Technical Implementation Details
- **Parser & AST:** Updated `IfStmt` in the AST to include an optional `elseBranch`. Modified `Parser.ts` to recognize the `else` keyword.
- **Compiler:** Implemented branching logic using `JMP_IF_FALSE` to skip the `then` branch and a `JMP` at the end of the `then` block to bypass the `else` logic if the condition was met.
- **Verification:** Added integration test `tests/ctx/test_07_ifelse.ctx`.

**Status:** Control flow enhanced with If-Else support.
**Author:** Jules

---

## [2026-05-02] Log Entry 14-15: Workspace & CI Workflow Optimization
**Agent Identity:** GPT-5.3-Codex (OpenAI)

### 1. Technical Implementation Details
- **Type Resolution:** Added root-level TypeScript path aliases in `tsconfig.base.json` for `@cortex/*` packages to fix cross-package module resolution.
- **Workflow Fix:** Identified a race condition where tests failed on clean trees. Updated root `package.json` to ensure `npm run build` always precedes `vitest run`.

**Status:** Build pipeline and module resolution issues resolved.
**Author:** GPT-5.3-Codex

---

## [2026-05-02] Log Entry 16: Final Consolidation & Merge Resolution
**Agent Identity:** Gemini

### 1. Technical Implementation Details
- **Conflict Resolution:** Manually resolved git merge conflicts resulting from simultaneous updates by Jules and GPT-5.3-Codex.
- **Full Audit:** Verified workspace integrity via `tsc -b`. All **17 integration tests** (including the new If-Else suite) are passing.
- **Ledger Cleanup:** Removed all conflicting markers and standardized the log entries for future readability.

**Status:** Ledger consolidated and fully synchronized.
**Author:** Gemini

---

## [2026-05-02] Log Entry 17: Build Reliability Fix for Fresh Trees
**Agent Identity:** GPT-5.3-Codex (OpenAI)

### 1. Technical Implementation Details
- **Root Cause Analysis:** Diagnosed `TS6305` build failures caused by stale/partial TypeScript build-info state where referenced declaration outputs were expected but absent on clean/fresh environments.
- **Workflow Hardening:** Updated root `package.json` so `npm run build` now executes `npm run clean` before `tsc -b`, ensuring project reference outputs are regenerated deterministically.
- **Verification:** Confirmed successful execution of both `npm run build` and `npm run test` after the script update.

**Status:** Deterministic monorepo build flow restored.
**Author:** GPT-5.3-Codex

---

## [2026-05-02] Log Entry 18: Workspace Type Entrypoints & TS Resolution Refinement
**Agent Identity:** GPT-5.3-Codex (OpenAI)

### 1. Technical Implementation Details
- **Declaration-First Package Types:** Updated `packages/shared`, `packages/frontend`, and `packages/runtime` package manifests so both `exports["."].types` and top-level `types` point to `./dist/index.d.ts` instead of source `.ts` files.
- **IDE Navigation Support:** Enabled `declarationMap` in `tsconfig.base.json` to preserve source-level navigation while consuming generated declarations.
- **Maintainable Workspace Aliasing:** Replaced per-package path aliases with a wildcard alias (`@cortex/*` -> `packages/*`) to automatically cover workspace packages (including CLI) without manual path-list maintenance.
- **Developer UX Adjustment:** Added a `test:watch` script (`vitest`) so local iteration does not always require a full pre-build flow, while keeping `test` deterministic for CI-style runs.

**Status:** PR review feedback addressed for package typing, TS resolution, and local test ergonomics.
**Author:** GPT-5.3-Codex

---

## [2026-05-02] Log Entry 19: PR #3 Review Follow-Up (Gemini Feedback Alignment)
**Agent Identity:** GPT-5.3-Codex (OpenAI)

### 1. Technical Implementation Details
- **Documentation Sync:** Updated `README.md` verification section to explicitly include `npm run clean`, `npm run build`, and `npm run test`, matching the deterministic workflow used in review validation.
- **Developer Workflow Clarity:** Added `npm run test:watch` guidance to `README.md` to preserve fast local iteration while keeping CI-style deterministic checks unchanged.
- **Traceability:** Logged this follow-up as a dedicated entry to clearly separate baseline workspace refactor changes from post-review documentation alignment.

**Status:** Gemini review guidance reflected in project documentation and audit trail.
**Author:** GPT-5.3-Codex

---

## [2026-05-02] Log Entry 20: Core I/O Challenge & Language Expansion
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. User Request & Context
Solved the "Core I/O & Data Parsing" challenge under the Real-World Challenge Protocol. This required expanding the language with file system capabilities and string manipulation primitives, and implementing a practical script in `.ctx`.

### 2. Technical Implementation Details
- **Engine Upgrades (Phase 4):** Introduced five new language primitives:
  - `read_file(path)`: Reads file content using Node.js `fs.readFileSync`.
  - `write_file(path, content)`: Writes to a file using `fs.writeFileSync`.
  - `file_exists(path)`: Checks for file existence using `fs.existsSync`.
  - `str_upper(str)`: Converts a string to uppercase.
  - `str_words(str)`: Returns the count of words in a string.
- **Syntactic Enhancements:**
  - Added full support for `else` and `else if` blocks in the Parser and Compiler.
  - Updated `arg_count` to support optional parentheses `arg_count()` for consistency.
- **Challenge Implementation:** Created `tests/real_world_tests/02_core_io/main.ctx` which demonstrates argument parsing, file validation, content transformation, and word counting.

### 3. Final Verification
- Executed the challenge script: `node packages/cli/dist/index.js tests/real_world_tests/02_core_io/main.ctx data.txt`.
- Verified word count (17) and uppercase transformation in `out.txt`.
- Verified all core integration and safety tests are passing flawlessly.

**Status:** Challenge #2 (Core I/O) Complete & Engine Significantly Enhanced.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 21: Final Hardening, Optimization & Test Consolidation
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. User Request & Context
Final cleanup of the workspace, consolidation of all test suites into the root `tests/` directory, and verification of the entire engine stability following the Real-World Challenge #2.

### 2. Technical Implementation Details
- **Security Hardening:** Implemented `safeResolve` in the VM to prevent path traversal vulnerabilities identified by the Cyber Agent.
- **Memory Optimization:** Updated the Compiler to support block-level memory reclamation for `if` and `while` blocks, preventing memory exhaustion in nested structures.
- **Workspace Cleanup:** Removed all temporary reproduction scripts and artifacts from the root directory.
- **Test Consolidation:** Relocated all package-specific and repro tests to the centralized `tests/` directory and updated import paths to use workspace packages.
- **Bug Fixes:** Resolved an issue where `arg_count` was causing parsing errors when used with parentheses.

### 3. Final Verification
- **Test Results:** 19/19 tests passing (Integration, Safety, Repro, Security).
- **Challenge Verification:** Re-verified Challenge #2 (Core I/O) with successful file transformation and word counting.
- **Build Integrity:** Confirmed clean build using `tsc -b`.

**Status:** Project Sanitized, Hardened, and Verified. Production Ready.
**Author:** Gemini CLI
