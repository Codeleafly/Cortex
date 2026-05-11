# Nox Solution Ledger

**Last Reconciled:** 2026-05-11
**Reconciler:** GPT-5.5-Codex

Every entry corresponds to a `Bug.md` entry.

## BUG-2026-05-11-01 — Array method-call pipeline

**Fix:** Method calls named `push`, `get`, and `len` now compile to array opcodes instead of dictionary lookup plus dynamic call. `ARRAY_PUSH`, `ARRAY_GET`, and `ARRAY_LEN` are implemented in the VM. Expression statements like `result.push(value)` on mutable variables store the returned array back into the receiver, allowing `std/sys/args()` to accumulate arguments.

**Verification:** `array_method_calls_update_mutable_receiver`, `std_sys_args_uses_array_methods`, and `cargo test -q`.

## BUG-2026-05-11-02 — Safe malformed `!strict` lexing

**Fix:** The lexer now checks the remaining source slice with `get(...)` before comparing against `strict`, eliminating direct unchecked indexing for short malformed directives.

**Verification:** `malformed_strict_directive_does_not_panic` and `cargo test -q`.

## BUG-2026-05-11-03 — Duplicate match relocation bookkeeping

**Fix:** The `Stmt::Match` compiler branch records each emitted jump operand once, preventing duplicate relocation of the same bytecode cell.

**Verification:** `match_jump_offsets_are_recorded_once_per_jump_operand` and `cargo test -q`.

## BUG-2026-05-11-04 — Import/export filtering

**Fix:** CLI module resolution now tracks requested names per source, verifies those names against module exports, exposes only requested exported functions to importing compilers, and filters imported module top-level statements to avoid blanket side-effect inclusion.

**Verification:** `linked_imports_only_expose_requested_exports` and `cargo test -q`.

## BUG-2026-05-11-05 — Stale CLI command documentation

**Fix:** `AGENTS.md` now references the actual package name: `cargo run --package nox -- repl`.

**Verification:** Documentation review and `cargo test -q`.

## BUG-2026-05-11-06 — Arrow block function parsing

**Fix:** Function declarations using `=> { ... }` now parse the block as a function body instead of treating `{ ... }` as a dictionary expression. This aligns the parser with current stdlib syntax.

**Verification:** `std_sys_args_uses_array_methods` and `cargo test -q`.
