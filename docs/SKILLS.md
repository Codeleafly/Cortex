# Agent Skills in Cortex

Agent Skills provide a standardized way to give AI agents new capabilities and expertise within the Cortex ecosystem.

## Overview
A skill is a folder containing a `SKILL.md` file with metadata and instructions. Skills allow agents to capture specialized knowledge (e.g., "How to add a new Bytecode instruction") into portable, version-controlled procedures.

## Structure
```
skills/skill-name/
├── SKILL.md          # Metadata + Instructions
├── scripts/          # (Optional) Reusable logic
└── references/       # (Optional) Technical deep-dives
```

## Best Practices
1. **Start from Expertise:** Ground skills in real tasks. If an agent solves a complex bug, extract that pattern into a skill.
2. **Omit the Obvious:** Focus on project-specific facts (e.g., "VM memory limit is 1024") rather than general concepts.
3. **Favor Procedures:** Teach the *approach* to a class of problems, not just the answer to one.
4. **Validation Loops:** Always include instructions for the agent to verify its work after execution.

## Available Skills
- `skill-creator`: A built-in skill to help agents design effective new capabilities.

For the full specification, visit [agentskills.io](https://agentskills.io).
