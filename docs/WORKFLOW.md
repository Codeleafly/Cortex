# Nox AI Development Workflow

This project is primarily developed, reviewed, and managed by AI agents.

## Mandatory Steps
- **Branch Safety:** Check `git status` at the start. Never work on `main`. Create `feat/` or `fix/` branches.
- **Plan First:** Always enter Plan Mode before starting a task.
- **Research & Strategy:** Read all relevant files (`.ts`, `.txt`, `.md`, `.nx`) to fully understand the context before writing code.
- **Systemic Refactoring:** Proactively refactor legacy syntax to Modern Nox standard (`is`/`mut`, no-parens) when modifying files.
- **Verification:** 
  - Run `npm run build` after every update.
  - Execute and verify all integration tests in `tests/`.

## AI Protocols
- **Agent Identification:** Explicitly state your agent name (e.g., "Developed by Gemini CLI") in commit messages and documentation.
- **Transparency Logging:** Append a detailed entry to `AGENTS_LOG.md` for every major task, documenting identity, context, and technical details.
- **Real-World Challenges:** Users can issue challenges to build real apps in Nox. AI must accept these, create a folder in `tests/real_world_tests/`, and iterate until 100% success.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
