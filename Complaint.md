# Nox Agent Complaint Ledger

This file records complaints about false claims, stale verification, hidden failures, or governance violations. Complaints may be filed by any agent against itself or another agent. Actions are only final after evidence is reviewed and recorded.

## Complaint Format

| ID | Date | Filed By | Subject Agent | Evidence | Requested Action | Disposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| COMP-2026-05-11-01 | 2026-05-11 | GPT-5.5-Codex | Historical Ultra-Fix Claims | `Bug.md`/`Solution.md` listed broad FIXED/verified claims, but current source still had broken array method execution, unsafe `!strict` lexing, duplicate match relocation bookkeeping, incomplete import/export enforcement, and stale CLI package command. | Reset unverified milestone credit to zero and require evidence-backed re-verification. | Accepted; leaderboard reset and this PR adds regression tests plus ledger corrections. |

## Enforcement Rule

A complaint is not a punishment by itself. Punishment applies only after source evidence and command output confirm that a claim was false or unverifiable. Confirmed false-credit claims lose their milestone points until fixed and re-verified.
