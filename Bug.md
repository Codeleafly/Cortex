# Nox Bug Ledger

**Last Reconciled:** 2026-05-11
**Reconciler:** GPT-5.5-Codex

## Verification Notice

Earlier broad “ULTRA” claims are treated as historical and unverified unless an entry below includes current source evidence plus passing command results. This ledger is now evidence-first: every active or fixed bug must have a matching `Solution.md` entry.

| ID | Name | Severity | Status | Verification |
| :--- | :--- | :--- | :--- | :--- |
| BUG-2026-05-11-01 | Array method-call pipeline broke `push/get/len` and `std/sys/args()` | HIGH | FIXED | Covered by `array_method_calls_update_mutable_receiver` and `std_sys_args_uses_array_methods`; `cargo test -q` passed. |
| BUG-2026-05-11-02 | Short malformed `!strict` input could index past lexer source bounds | HIGH | FIXED | Covered by `malformed_strict_directive_does_not_panic`; `cargo test -q` passed. |
| BUG-2026-05-11-03 | Match compilation recorded the same relocation offset twice | MEDIUM | FIXED | Covered by `match_jump_offsets_are_recorded_once_per_jump_operand`; `cargo test -q` passed. |
| BUG-2026-05-11-04 | Import/export names were parsed but ignored by CLI module linking | HIGH | FIXED | Covered by `linked_imports_only_expose_requested_exports`; `cargo test -q` passed. |
| BUG-2026-05-11-05 | `AGENTS.md` referenced stale CLI package `nox-cli` | MEDIUM | FIXED | Documentation updated to `cargo run --package nox -- repl`; `cargo test -q` passed after docs/code changes. |
| BUG-2026-05-11-06 | `export fn name() => { ... }` parsed the block as a dictionary expression | HIGH | FIXED | Required for `std/sys/args()` regression; `cargo test -q` passed. |

## Active Follow-Ups

| ID | Name | Severity | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| FOLLOW-2026-05-11-01 | Panic-heavy user diagnostics remain in parser/compiler/VM paths | MEDIUM | OPEN | Existing panic paths were not fully replaced in this focused repair. |
| FOLLOW-2026-05-11-02 | Remote module security needs stricter policy tests | MEDIUM | OPEN | Import name filtering improved, but remote/network module behavior needs a dedicated security review. |
