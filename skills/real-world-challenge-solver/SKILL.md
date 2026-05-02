---
name: real-world-challenge-solver
description: Standard workflow for the 'Real-World Challenge Protocol'. Activate this when a user issues a challenge to build a specific application in Cortex.
---

# Real-World Challenge Solver Skill

This skill ensures that all user challenges are accepted and completed following the project's strict protocols.

## Procedure

### 1. Discovery & Setup
- Confirm acceptance of the challenge.
- Create a dedicated folder: `tests/real_world_tests/XX_challenge_name/`.
- Initialize a baseline Cortex script `app.ctx` in that folder.

### 2. Gap Analysis
- Identify which language features are missing to complete the app (e.g., "Need file I/O", "Need string concatenation").
- List these missing features as technical requirements.

### 3. Iterative Engine Upgrades
- For each missing feature, use the `bytecode-instruction-adder` skill to upgrade the Cortex engine.
- Verify each upgrade with small targeted tests.

### 4. Application Implementation
- Write the final application code in Cortex.
- Use flags, built-ins, and complex logic as requested.

### 5. Final Verification & Logging
- Run the app via `cortex path/to/app.ctx [args]`.
- Ensure output matches expectations.
- Log the completion in `AGENTS_LOG.md` with the "Challenge Complete" status.

## Rule Reminder
- **Never stop until 100% success.** If a build fails or an error occurs, backtrack and fix the engine until the challenge code runs perfectly.
