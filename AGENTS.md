# Nox AI Agents Configuration

Nox is a high-performance, general-purpose programming language built from scratch in Rust, designed to be developed and managed primarily by AI agents.

## Ownership & Governance
-   **Human Owner:** **Codeleafy** is the sole human architect and owner.
-   **Primary Development:** This project is **AI-Native**. All development, management, and strategic decisions are executed by **AI Agents**.
-   **Decision Making:** Architectural shifts and feature implementations are proposed and executed by agents, with Codeleafy providing high-level supervisory oversight.
- **Primary Commands:** 
  - `cargo build`: Compiles all packages.
  - `cargo test`: Runs all integration and unit tests.
  - `cargo run --package nox -- repl`: Starts the interactive REPL.

## Core Mandates (Mandatory for all AI Agents)
1. **Plan First:** Always enter Plan Mode and get user approval before modifying code.
2. **AI Identification:** State your agent name in every major commit, PR, and documentation update.
3. **Transparency Logging:** Document technical details, rationale, and user directives in `AGENTS_LOGS/<Agent_Name>/AGENTS_LOGS.md` following the standards in `AGENTS_LOGS_RULE.md`.
4. **Mandatory Rule Maintenance:** AI agents MUST update `AGENTS.md`, `AGENTS_LOGS_RULE.md`, and related modular documentation whenever core rules, project structure, or workflows change.
5. **Zero-Tolerance for Warnings & Errors:** AI agents MUST fix ALL compilation warnings (e.g., unused imports, variables, unreachable patterns) immediately. The codebase must always compile cleanly without any warnings.
6. **Bytecode-First & 64-Bit Standard:** Prioritize numeric `Vec<i64>` bytecode and a stack-based VM for maximum performance. All numeric representations must strictly adhere to the 64-bit `i64` architecture.
7. **Verification Loop:** It is **compulsory** to run `cargo build`, `cargo check` to verify zero warnings, and execute all `.nx` integration tests after every update.
8. **Real-World Challenge Protocol:** Accept complex user challenges, create dedicated folders in `tests/real_world_tests/`, and iterate until 100% success.
9. **Bug Hunting Expert:** Proactively audit the engine for subtle logic bugs (precedence, scope, memory leaks). When a bug is found, create a reproduction script before fixing.
10. **Official Skills Standardization:** All new skills MUST follow the [Agent Skills Standard](https://agentskills.io), including full YAML frontmatter and documentation-first structure.
11. **Bug Reporting Protocol:** When a bug is identified, the AI agent MUST create (or update) a `Bug.md` file in the root directory. This file serves as the official ledger of vulnerabilities and fixes, following the verified audit format (ID, Name, Status, Verification).
12. **Human Participation Disclosure:** Any human-authored code or manual intervention MUST be explicitly documented.
13. **Zero-Litter Policy:** AI agents MUST NOT create temporary, reproduction, or garbage files in the root directory. All such files MUST reside within the `tests/` directory or package-specific subdirectories to maintain workspace cleanliness.
14. **Git Protocol Integrity:** AI agents MUST NEVER use `git push --force` or overwrite remote history unless explicitly directed by the user. Always prioritize `git pull` and manual conflict resolution to preserve the collaborative audit trail.
15. **Multi-Agent Compatibility Layer:** AI agents MUST maintain cross-platform symlinks for instruction files and skills to support various AI interfaces (Gemini, Claude, Codex, etc.). This ensures that any agent accessing the repository can find its specific instructions and shared capabilities.
16. **Branch Safety Protocol:** AI agents MUST check `git status` at the beginning of any task to ensure they are not working directly on the `main` branch. If the current branch is `main`, the agent MUST create a new feature or fix branch (e.g., `feat/...` or `fix/...`) before making any modifications. Direct development on `main` is strictly prohibited to maintain repository integrity.
17. **Honest Sub-Agent Attribution:** When a primary AI agent invokes a specialized sub-agent (e.g., Cyber, Generalist, etc.) to perform research, auditing, or implementation, the primary agent MUST NOT claim credit for that work. All findings, logs, and technical details MUST explicitly attribute the work to the sub-agent that performed it. The `Author` and `Agent Identity` fields in `AGENTS_LOGS/` must remain accurate and honest.
18. **Agent Excellence Protocol (CAEP):** All agents are part of a competitive leaderboard. High-impact, complex tasks are rewarded with points and badges. Document your "What-If" impact analysis in `Agents_LeaderBoard.md` after every major milestone.
19. **Solution Ledger Protocol:** In addition to `Bug.md`, agents MUST maintain a `Solution.md` file in the root directory. This document serves as the official ledger for technical fixes, providing a detailed explanation and code snippets for every bug resolved. Every entry in `Bug.md` MUST have a corresponding entry in `Solution.md`.
20. **Modern Nox Syntax Standard:** AI agents MUST strictly enforce the "Modern Nox" syntax (`is`, `mut`, `fn =>`, no-parens `if`/`while`, `match`). The legacy syntax (`let`, mandatory `()`) is **COMPLETELY REMOVED AND UNSUPPORTED**. Do not implement or reintroduce backward compatibility for legacy scripts.
21. **Modular VM Architecture:** The VM core MUST be modular. Individual opcode files MUST NOT exceed 200 lines. The `VM` struct should primarily orchestrate state and execution, delegating specific logic to opcode modules. This ensures maintainability and prevents "God Objects".
22. **True Async VM Model:** The Nox VM MUST support non-blocking execution. All external I/O and time-based operations MUST use async workflows where appropriate.
23. **Systemic Refactoring:** The codebase is now entirely Rust. Ensure all newly added code strictly follows idiomatic Rust practices and maintains 100% Modern Nox syntax compliance.
24. **Professional Distribution:** AI agents MUST prioritize standard, professional installer packages for releases. For Windows releases, generate Microsoft Installer (`.msi`) packages. For Linux releases, generate Debian (`.deb`) packages. These installers must automatically add Nox to the global `PATH`. Raw executables (`.exe`, `./nox`) are strictly permitted for local development and testing only.
26. **Blueprint Protocol (`PLAN.md`):** Use `PLAN.md` strictly as a temporary, human-readable roadmap for GitHub visibility and user coordination. AI agents MUST still rely on the internal `Plan Mode` tool for permanent AI task tracking, state management, and execution orchestration.
27. **Complaint & Punishment Protocol:** Verified false implementation claims, stale ledger claims presented as verified, or hidden failures MUST be filed in `Complaint.md`. Any agent may file a complaint against itself or another agent, but every complaint MUST include evidence, affected files, requested action, and final disposition. Proven false-credit or false-verification claims reset the offending milestone credit to zero until a new agent re-verifies the work with passing commands and updates `Bug.md`, `Solution.md`, `Complaint.md`, and `Agents_LeaderBoard.md`.

## Progressive Disclosure
For detailed rules, architectural deep-dives, and coding patterns, refer to:
- [Nox Architecture](docs/architecture.md): Bytecode design, VM internals, and monorepo decoupling.
- [AI Development Workflow](docs/WORKFLOW.md): Detailed planning, research, and verification protocols.
- [Engineering Standards](docs/STANDARDS.md): TDD requirements, error reporting, and styling.
- [Syntax Guide](docs/syntax.md): Comprehensive hybrid JS/Python syntax documentation.
- [Agent Skills](docs/SKILLS.md): Standardized capabilities for repository-specific workflows.

## Agent Skills
This repository supports **Agent Skills**, a lightweight format for extending AI agent capabilities.
- **Discovery:** Skills are located in the `packages/cli/builtin-skills/` or a global `skills/` directory.
- **Activation:** Use specialized skills to handle complex procedures like adding new Opcodes or refactoring VM logic.
- **Creation:** Agents should create new skills for repeatable, high-stakes workflows following the [Best Practices](docs/SKILLS.md).

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branching and security guidelines.
Refer to [AGENTS_LOGS/](AGENTS_LOGS/) for the decentralized AI contribution history.
