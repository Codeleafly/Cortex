---
name: real-world-challenge-solver
description: The official protocol for accepting and completing complex user challenges in the Nox ecosystem. Use this when the user issues a high-stakes request to build a practical application (e.g., 'Build a CLI calculator').
license: MIT
metadata:
  version: "1.1.0"
---

# Real-World Challenge Solver Skill

This skill mandates an iterative, 100% success-driven workflow for solving complex practical challenges.

## Protocol

### 1. Acceptance
- Create a dedicated folder in `tests/real_world_tests/` (e.g., `XX_project_name`).
- Document the challenge goals in a `README.md` within that folder.

### 2. Gap Analysis
- Identify any missing language features (e.g., file I/O, regex, network) needed to complete the project.
- Use the `bytecode-instruction-adder` skill to implement missing features in the engine.

### 3. Iterative Implementation
- Build the project step-by-step in Nox (`.nx`).
- Persistently update the engine until the challenge code runs without errors.

### 4. Verification
- Final project MUST be functional and verified via the CLI.
- Run `npm test` to ensure zero regressions in the core engine.

## Status
Challenges are considered "Complete" only when the application is fully functional and documented.
