# Cortex AI Development Workflow

This project is primarily developed, reviewed, and managed by AI agents.

## Mandatory Steps
- **Plan First:** Always enter Plan Mode before starting a task.
- **Research & Strategy:** Read all relevant files (`.ts`, `.txt`, `.md`, `.ctx`) to fully understand the context before writing code.
- **Verification:** 
  - Run `npm run build` after every update.
  - Execute and verify all `.ctx` tests in `tests/ctx/` and `tests/real_world_tests/`.

## AI Protocols
- **Agent Identification:** Explicitly state your agent name (e.g., "Developed by Gemini CLI") in commit messages and documentation.
- **Transparency Logging:** Append a detailed entry to `AGENTS_LOG.md` for every major task, documenting identity, context, and technical details.
- **Real-World Challenges:** Users can issue challenges to build real apps in Cortex. AI must accept these, create a folder in `tests/real_world_tests/`, and iterate until 100% success.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
