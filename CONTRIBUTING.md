# Contributing to Cortex

Thank you for your interest in contributing to Cortex! This project follows a strictly regulated, AI-first development model.

## 1. Branching and Workflow Strategy
- **`main` is Sacred:** Direct pushes to the `main` branch are strictly prohibited.
- **Feature Branching:** All changes must originate from a dedicated branch (e.g., `feature/awesome-new-syntax` or `fix/lexer-edge-case`).
- **Pull Requests (PRs):** Every change must be submitted via a PR with a clear description of the "why" and "what".

## 2. Code Quality and Linting
- **Automated Linting:** PRs will only be merged if they pass all automated linting checks (Prettier/ESLint).
- **Zero Warnings Policy:** All warnings are treated as errors. The codebase must remain clean at all times.

## 3. Safety and Security Rules
- **Signed Commits:** All contributors are encouraged (and in some cases required) to GPG-sign their commits for verification.
- **Secret Scanning:** Never commit secrets or API keys. Keep environment variables strictly within `.env` files (which are ignored).
- **Dependency Audit:** A security audit is mandatory before adding any new third-party libraries.

## 4. Testing Requirements
- **Unit Tests:** Every new feature must include unit tests with at least **80% test coverage**.
- **Breaking Changes:** Any change that breaks backward compatibility must include a strong justification and a migration guide.

## 5. Documentation First Approach
- **Inline Comments:** Use comments for any complex or non-obvious logic.
- **README & Docs Update:** If a feature is modified, the contributor is responsible for updating `README.md` and relevant documentation.

## 6. Code of Conduct
- **Respectful Communication:** Construction feedback only in PR reviews.
- **Inclusive Language:** Offensive or biased language in code or documentation is strictly forbidden.

## 7. AI-Centric Development Model
- **AI-First:** Cortex is primarily built, reviewed, and maintained by AI agents (like Gemini CLI).
- **AI Code Reviewers:** Pull Requests (PRs) are primarily reviewed by AI agents to ensure compliance with standards, security, and logic correctness.
- **AI Issue Management:** Bugs, features, and optimizations are proactively identified and managed as issues by AI agents.
- **AI Agent Identification:** Any AI agent (e.g., Gemini CLI) contributing to this project MUST identify itself in the context of its updates (commit messages, PRs, or logs).
- **Mandatory AI Logging:** Every AI agent MUST record its activities, rationale, and implementation details in `AGENTS_LOG.md`.
- **Human Participation & Documentation:** While human developers can review code and create issues, AI remains the primary driver. **Any human-authored code, manual review, or intervention MUST be explicitly documented** in inline comments or relevant documentation to maintain transparency in the AI-led development process.
