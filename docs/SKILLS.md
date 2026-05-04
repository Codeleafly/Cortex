# Agent Skills in Nox

Agent Skills provide a standardized way to give AI agents new capabilities and expertise within the Nox ecosystem. This project follows the [Agent Skills Open Standard](https://agentskills.io).

## Overview
A skill is a portable, version-controlled package containing a `SKILL.md` file with metadata and instructions. Skills allow agents to capture specialized knowledge into discoverable capabilities.

## Structure
```
skills/skill-name/
├── SKILL.md          # Required: YAML frontmatter + instructions
├── scripts/          # (Optional) Executable code
├── references/       # (Optional) Technical deep-dives
└── assets/           # (Optional) Templates and resources
```

## Mandatory Frontmatter
Every `SKILL.md` MUST begin with YAML frontmatter:
```yaml
---
name: skill-name        # Kebab-case, matches directory
description: "..."     # Clear trigger-focused description
license: MIT
metadata:
  version: "1.0.0"
---
```

## Available Skills
- `skill-creator`: Meta-skill for designing new Agent Skills.
- `bug-hunter`: Expert procedure for logic forensics and engine auditing.
- `bytecode-instruction-adder`: Workflow for adding new Opcodes and syntax.
- `real-world-challenge-solver`: Protocol for 100% success-driven user challenges.
- `performance-optimizer`: Guardrails for Bytecode-First purity.
- `monorepo-package-generator`: Standards for monorepo expansion.

## Best Practices
1. **Focus:** Keep each skill focused on one specific job.
2. **Standardization:** Adhere to the `agentskills.io` specification.
3. **Progressive Disclosure:** Move long reference material to `references/` to save context tokens during discovery.
4. **Validation:** Always include steps for the agent to verify its work.

