# Nox Package Ecosystem (High Detail Analysis)

This document provides an exhaustive breakdown of the Nox monorepo structure, dependencies, and inter-package linkages. Nox is an **AI-Native** project where all packages are designed to be decoupled yet strictly synchronized through a shared contract.

## 1. Root Workspace (`/`)
The root directory acts as the orchestrator for the entire ecosystem.

-   **Purpose:** Manages the monorepo lifecycle, builds, and cross-package testing.
-   **Key Scripts:**
    -   `npm run build`: Executes `tsc -b`. This uses TypeScript Project References to compile packages in the correct dependency order (`shared` -> `frontend`/`runtime` -> `cli`).
    -   `npm run test`: Runs the Vitest suite. It ensures integration between the compiler and the VM.
    -   `npm run clean`: Uses `tsc -b --clean` to wipe build artifacts safely.
-   **Tooling:**
    -   `vitest`: Chosen for its speed and native ESM support, critical for the Nox 'module' architecture.
    -   `typescript`: Strict mode is enforced globally via `tsconfig.base.json`.

---

## 2. `@nox/shared` (`packages/shared`)
The "Contract" of the language. This package contains no logic, only definitions.

-   **Role:** Ensures that the Frontend (Compiler) and the Runtime (VM) use the exact same numeric identifiers for operations.
-   **Key Exports:**
    -   `Opcode`: An enum of 32-bit integers. Using numeric opcodes instead of strings prevents overhead during VM execution.
    -   `TokenType`: Definitions for the Lexer and Parser.
-   **Linkage:** Every other package depends on `@nox/shared`. Any change here requires a full rebuild of the ecosystem.

---

## 3. `@nox/frontend` (`packages/frontend`)
The "Architect". It transforms human-readable code into machine-executable bytecode.

-   **Components:**
    -   **Lexer:** Handles string scanning, including complex escape sequences like `\e` (ANSI) for terminal styling.
    -   **Parser:** A recursive-descent parser that builds a formal AST. It supports hybrid JS/Python syntax.
    -   **Compiler:** A one-pass AST-to-Bytecode generator.
-   **High-Detail Logic:**
    -   **Scope Management:** Uses a stack of Maps to handle nested block scopes and function locals.
    -   **Bytecode Optimization:** Implements short-circuiting for `&&` and `||` using `JMP_IF_FALSE` and `JMP_IF_TRUE`.
    -   **Numeric Safety:** Validates that all integer literals fit within the 32-bit signed range before emitting `PUSH` opcodes.

---

## 4. `@nox/runtime` (`packages/runtime`)
The "Engine". A high-performance, stack-based Virtual Machine.

-   **Architecture:**
    -   Uses `Int32Array` for bytecode storage to leverage TypedArray performance in V8.
    -   **Memory Segments:**
        -   `Stack`: Operand processing (1024 slots).
        -   `Globals`: Absolute addressing (512 slots).
        -   `Memory`: Local frame-relative storage (1024 slots).
-   **Security (Sandbox):**
    -   Implements a strict path-resolution algorithm to prevent "Sandbox Escapes" (`..` traversal).
    -   **Permissions:** Granular `read`, `write`, and `run` permissions.
-   **Dependencies:**
    -   `readline-sync`: Used for the `read_line()` built-in to provide blocking synchronous I/O.

---

## 5. `@nox/cli` (`packages/cli`)
The "Gateway". The primary entry point for users and agents.

-   **Interface:**
    -   Built using **React** and **Ink** to provide a modern, interactive CLI experience.
    -   Features a multi-line REPL with state persistence.
-   **Functionality:**
    -   Parses Deno-style flags (e.g., `--allow-read`, `--allow-all`).
    -   Handles file execution logic and error reporting with source-code context.
-   **Binaries:**
    -   Exports the `nox` command globally.

---

## Ownership Summary
-   **Human Owner:** Codeleafy (Supervisory role).
-   **Primary Developers:** AI Agents (Architectural, Implementation, and Audit roles).
