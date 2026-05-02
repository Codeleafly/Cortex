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

---

## [2026-05-01] Log Entry 5: Architectural Cleanup & AGENTS.md Standardization
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user identified several rule violations (use of `any`, missing Parser stage) and requested a standardization of AI instructions following the global `AGENTS.md` standard (Matt Pocock's guide).

### 2. Technical Implementation Details
- **Architectural Cleanup:** 
  - Integrated a formal **Parser** and **AST** stage in `@cortex/frontend`.
  - Refactored the `@cortex/frontend` Compiler to walk the AST instead of a single-pass token stream, enabling more complex language features in the future.
  - Eliminated `any` type violations in `VM.ts`, `index.ts`, and `Repl.tsx` by using explicit union types and `unknown` for error catching.
  - Relocated VM integration tests from `cli` to `@cortex/runtime`.
- **Documentation Refactor (Progressive Disclosure):**
  - Consolidated redundant `GEMINI.md` and `CLAUDE.md` into a minimal root `AGENTS.md`.
  - Moved detailed rules to `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, and `docs/STANDARDS.md`.
- **Bug Fixes:** Resolved a build/test failure caused by missing `Parser` imports in the relocated test suite.

### 3. Final Verification
- Clean build via `tsc -b`.
- All 6 integration tests passing.
- REPL verified for state persistence and optional semicolons.

**Status:** Documentation Standardized & Core Architecture Solidified.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 6: Expansion of Agent Skills Library
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user requested a massive expansion of the "Agent Skills" library to provide specialized workflows for various project tasks.

### 2. Technical Implementation Details
- **New Skills Created:** Implemented four core skills in the `skills/` directory to modularize agent knowledge:
  - `bytecode-instruction-adder`: End-to-end workflow for language expansion (Shared -> Frontend -> Runtime).
  - `real-world-challenge-solver`: Protocol for iterative, 100% success-driven challenge completion.
  - `monorepo-package-generator`: Standards for scaling the monorepo architecture.
  - `performance-optimizer`: Guardrails for Bytecode-First purity and type safety.
- **Progressive Disclosure Update:** Updated `docs/SKILLS.md` and `AGENTS.md` to reference these new capabilities.

### 3. Final Verification
- Verified all `SKILL.md` files follow the required format (Metadata + Instructions).
- Confirmed directory structure complies with the Agent Skills specification.

**Status:** AI Capabilities Expanded with Specialized Skills.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 7: Solidifying AI Governance in AGENTS.md
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user requested an audit of `AGENTS.md` to identify missing rules and mandated that AI agents must proactively maintain the root configuration file whenever the project evolves.

### 2. Technical Implementation Details
- **Rule Expansion:** Added critical mandates to `AGENTS.md` that were previously scattered or implied:
  - **Mandatory Rule Maintenance:** AI agents must update `AGENTS.md` in sync with project changes.
  - **Verification Loop:** Codified the requirement to run `npm run build` and all `.ctx` tests after every update.
  - **Human Participation Disclosure:** Explicit rule for documenting human-authored segments.
- **Structural Cleanup:** Refined the "Core Mandates" section to be exhaustive but concise, serving as a primary entry-point for any AI agent joining the project.

### 3. Final Verification
- Performed `npm run build` to ensure no disruptions.
- Verified that `AGENTS.md` correctly references all modular documentation.

**Status:** AI Governance Standardized & Root Config Solidified.
**Author:** Gemini CLI

---

## [2026-05-01] Log Entry 8: Documentation Audit & Refinement
**Agent Identity:** Gemini CLI

### 1. User Request & Context
The user requested a full read and fix of the `docs/` folder to ensure all information is accurate and consistent with the codebase.

### 2. Technical Implementation Details
- **Architecture Guide Update:** Corrected `architecture.md` to reflect the transition from one-pass compilation to a Two-Stage Frontend (Parser/AST).
- **CLI Guide Update:** Enhanced `cli.md` to explain the advanced multi-line detection logic instead of the placeholder `.editor` mode.
- **Skills Guide Update:** Updated `SKILLS.md` to list the four newly created repository skills (`bytecode-instruction-adder`, `real-world-challenge-solver`, etc.).
- **Consistency Check:** Verified that all examples in `syntax.md` and root files are compatible with the latest engine version.

### 3. Final Verification
- Built the project and ran tests to ensure documentation changes didn't affect the build graph.
- Verified all modular links in `AGENTS.md`.

**Status:** Documentation Audit 100% Complete & Verified.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 9: Deep Audit & Language Refinement
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. User Request & Context
Performed a deep audit of the engine and documentation to identify subtle logical bugs, edge cases, and inconsistencies after the primary vulnerability remediation.

### 2. Technical Implementation Details
- **Unary Minus Support:** Fixed a bug in the Lexer/Parser where negative numbers (e.g., `-5`) or negation expressions (e.g., `-x`) were not supported. Added `Opcode.MUL` with `-1` logic in the Compiler to handle this without new VM opcodes.
- **Block Scoping Fix:** Identified that `if` and `while` blocks were not creating new scopes, which could lead to variable name collisions with parent scopes. Updated `Compiler.ts` to push/pop scopes for these control flow structures.
- **Documentation Alignment:** Corrected `README.md` syntax examples. Standardized `print` usage and fixed a loop example that incorrectly used `let` for re-assignment.

### 3. Final Verification
- Verified all 11 tests (6 integration + 5 safety/recursion) are passing flawlessly.
- Confirmed that the REPL handle-submission logic correctly integrates with the updated compiler scope rules.

**Status:** Language Refinement & Documentation Synchronization Complete.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 10: Surgical Remediation (Phase 2)
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. User Request & Context
Addressed subtle "invisible" vulnerabilities identified during a Phase 2 audit: unbounded call stack, safe bytecode reads, and memory pointer fragmentation.

### 2. Technical Implementation Details
- **Safe Bytecode Read:** Implemented a `readOperand()` method in the VM that performs length checks before accessing bytecode, preventing pollution from truncated scripts.
- **Call Stack Depth Limit:** Implemented a 256-frame limit for the `callStack` to prevent host-level OOM crashes from infinite recursion.
- **Memory Pointer Isolation:** Fixed a logic bug where global variable stores were incorrectly updating the `memoryStackPointer`, which could "squeeze" available memory for local variables in future frames.
- **Strict Memory Typing:** Fully typed the internal `memory` array as `StackValue[]` to adhere to zero-tolerance `any` standards.

### 3. Final Verification
- Added 3 new edge-case tests to `safety.test.ts` for Call Stack Overflow, Truncated Bytecode, and Memory Pointer Isolation.
- Verified all 14 tests (6 integration + 8 safety) are passing.

**Status:** Phase 2 Vulnerability Remediation Complete. Project fully hardened.
**Author:** Gemini CLI

---

## [2026-05-02] Log Entry 11: Agent Skills Standardization & Expert Expansion
**Agent Identity:** Gemini CLI (Interactive CLI Agent)

### 1. User Request & Context
Standardized the AI governance and Agent Skills framework to comply with official industry standards (agentskills.io and MCP). Expanded the capabilities with expert-level skills for bug hunting and skill creation.

### 2. Technical Implementation Details
- **Governance Update:** Updated `AGENTS.md` with mandates for "Bug Hunting Expert" and "Official Skills Standardization".
- **Agent Skills Migration:** Refactored all skills in `skills/` to use the official YAML frontmatter (name, description, license, metadata).
- **New Meta-Skill:** Created `skill-creator` to guide AI agents in designing high-fidelity capabilities for the Cortex ecosystem.
- **Expert Audit Skill:** Created `bug-hunter` to formalize deep logic forensics and engine auditing protocols.
- **Documentation Sync:** Updated `docs/SKILLS.md` to reflect the new standardized structure and available expertise.

### 3. Final Verification
- Verified all `SKILL.md` files follow the required format.
- Confirmed that the build graph and test suite remain unaffected.

**Status:** AI Governance & Skills Ecosystem Standardized.
**Author:** Gemini CLI
