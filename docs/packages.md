# Nox Package Ecosystem (High Detail Analysis)

This document provides an exhaustive breakdown of the Nox Cargo workspace structure, dependencies, and inter-package linkages. Nox is an **AI-Native** project where all crates are designed to be decoupled yet strictly synchronized through a shared contract.

## 1. Root Workspace (`/`)
The root directory acts as the orchestrator for the entire ecosystem.

-   **Purpose:** Manages the Cargo workspace lifecycle, builds, and cross-package testing.
-   **Key Scripts:**
    -   `cargo build`: Compiles all packages in the correct dependency order (`nox-shared` -> `nox-frontend`/`nox-runtime` -> `nox`).
    -   `cargo test`: Runs the native Rust test suite. It ensures integration between the compiler and the VM.
    -   `cargo clean`: Wipes build artifacts safely to save disk space.
-   **Tooling:**
    -   `cargo`: Chosen for its speed and native Rust dependency management.
    -   `rustc`: Strict mode and warnings are enforced globally.

---

## 2. `nox-shared` (`packages/shared`)
The "Contract" of the language. This crate contains no logic, only definitions.

-   **Role:** Ensures that the Frontend (Compiler) and the Runtime (VM) use the exact same numeric identifiers for operations.
-   **Key Exports:**
    -   `Opcode`: An enum represented as `i64`. Using numeric opcodes instead of strings prevents overhead during VM execution.
    -   `TokenType`: Definitions for the Lexer and Parser.
-   **Linkage:** Every other crate depends on `nox-shared`. Any change here requires a full rebuild of the ecosystem.

---

## 3. `nox-frontend` (`packages/frontend`)
The "Architect". It transforms human-readable code into machine-executable bytecode.

-   **Components:**
    -   **Lexer:** Handles string scanning, including complex escape sequences like `\e` (ANSI) for terminal styling.
    -   **Parser:** A recursive-descent parser that builds a formal AST. It supports hybrid JS/Python syntax.
    -   **Compiler:** A one-pass AST-to-Bytecode generator.
-   **High-Detail Logic:**
    -   **Scope Management:** Uses a stack of HashMaps to handle nested block scopes and function locals.
    -   **Bytecode Optimization:** Implements short-circuiting for `&&` and `||` using `JMP_IF_FALSE` and `JMP_IF_TRUE`.
    -   **Numeric Safety:** Validates that all integer literals fit within the 64-bit signed range before emitting `PUSH` opcodes.

---

## 4. `nox-runtime` (`packages/runtime`)
The "Engine". A high-performance, stack-based Virtual Machine.

-   **Architecture:**
    -   Uses `Vec<i64>` for bytecode storage to leverage native Rust performance.
    -   **Memory Segments:**
        -   `Stack`: Operand processing (1024 slots).
        -   `Globals`: Absolute addressing (512 slots).
        -   `Memory`: Local frame-relative storage (1024 slots).
-   **Security (Sandbox):**
    -   Implements a strict path-resolution algorithm to prevent "Sandbox Escapes" (`..` traversal).
    -   **Permissions:** Granular `read`, `write`, and `run` permissions.
-   **Dependencies:**
    -   `tokio`: Used for true async non-blocking execution inside the VM.

---

## 5. `nox` (`packages/cli`)
The "Gateway". The primary entry point for users and agents.

-   **Interface:**
    -   Built using **clap** and **colored** to provide a modern, interactive CLI experience.
-   **Functionality:**
    -   Parses command-line arguments and commands.
    -   Handles file execution logic and error reporting with source-code context.
-   **Binaries:**
    -   Exports the `nox` command globally.

---

## Ownership Summary
-   **Human Owner:** Codeleafy (Supervisory role).
-   **Primary Developers:** AI Agents (Architectural, Implementation, and Audit roles).
