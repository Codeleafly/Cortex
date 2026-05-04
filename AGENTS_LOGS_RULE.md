# Nox Agent Logging Standard (AGENTS_LOGS_RULE.md)

## Overview
To maintain a professional, scalable, and traceable audit trail of AI contributions, Nox uses a decentralized logging system. Every agent MUST follow this format to ensure accountability and clarity for both humans and other AI agents.

## Directory Structure
Logs are no longer stored in a single root file. They are organized by agent identity:
`AGENTS_LOGS/<Agent_Name>/AGENTS_LOGS.md`

## Logging Format Requirement
Each log entry MUST use the following Markdown structure:

```markdown
# [YYYY-MM-DD] Log Entry XX: <Brief Title>
**Agent Identity:** <Agent Name> (e.g., Gemini CLI, Jules, GPT-5.3-Codex)

### 1. User Instructions (Directives)
*   **Request:** <The exact or summarized request from the user>
*   **Constraints:** <Any specific constraints or rules mentioned by the user>

### 2. Technical Implementation Details
*   **Architecture Changes:** <What was changed at a system level>
*   **Files Modified:** <List of key files>
*   **Logic Forensics:** <Reasoning behind specific code choices>

### 3. Error Recovery & Course Corrections (Self-Audit)
*   **Mistakes Identified:** <Any errors made during execution, e.g., git mistakes, bugs introduced>
*   **Remediation:** <How the error was fixed and what was learned>

### 4. Final Verification
*   **Tests Run:** <List of tests executed>
*   **Success Criteria:** <Evidence of 100% completion>

**Status:** <e.g., Complete, Hardened, Production Ready>
**Author:** <Signature>
```

## Mandatory Rules
1.  **Atomic Logs:** Create a new entry for every significant task or "chapter" of work.
2.  **Honesty in Recovery:** If a mistake is made (e.g., a broken build, a force-push, a logic bug), it MUST be documented in Section 3.
3.  **User Instruction Tracking:** Always quote or summarize the user's intent to provide context for the changes.
4.  **No Deletion:** Never delete previous logs; only append new ones or fix typos if absolutely necessary.
