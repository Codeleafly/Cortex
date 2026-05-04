---
name: skill-creator
description: A meta-skill that teaches AI agents how to design and implement new Agent Skills for the Nox ecosystem. Use this when the project needs a new repeatable workflow or specialized capability.
license: MIT
compatibility: Gemini CLI, Claude Code, Cursor
metadata:
  version: "1.1.0"
  standard: agentskills.io
---

# Skill Creator

This skill provides a standardized workflow for creating high-fidelity Agent Skills that comply with the [Agent Skills Open Standard](https://agentskills.io).

## Workflow

### 1. Discovery & Design
- **Identify the Need:** Is there a repetitive task (e.g., adding opcodes, refactoring) that would benefit from a guided procedure?
- **Define Scope:** Keep each skill focused on one job. Omit the obvious and focus on project-specific procedures.

### 2. Implementation
- **Directory Structure:** Create a new folder in `skills/` using `kebab-case`.
- **SKILL.md:** Create the entry point with mandatory YAML frontmatter.
  ```yaml
  ---
  name: your-skill-name
  description: Clear trigger-focused description.
  license: MIT (or project standard)
  metadata:
    version: "1.0.0"
  ---
  ```
- **Instructions:** Write imperative, step-by-step guidance. Use examples of inputs/outputs and common edge cases.
- **Supporting Files:** Move detailed references to `references/` and executable code to `scripts/`.

### 3. Progressive Disclosure
- Ensure the `description` is concise (< 1024 chars) for efficient discovery.
- Keep `SKILL.md` under 500 lines.

### 4. Validation
- Verify the skill follows the directory name = `name` field rule.
- Test the skill by simulating the task it describes.

## Example
See `skills/bytecode-instruction-adder` for a reference implementation.
