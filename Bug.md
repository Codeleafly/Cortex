# Nox Vulnerability & Bug Report (v1.0.1 - Rust Hardening)
**Date:** 2026-05-06
**Agent:** Jules

## 1. Rust Migration Audit Status
The project has successfully migrated to a Rust-based 64-bit architecture. This audit identifies gaps in the current Rust implementation compared to the fully hardened TypeScript baseline.

| ID | Bug Name | Status | Verification |
| :--- | :--- | :--- | :--- |
| **RUST-STMT-01** | Missing `match` Statement Support | **FIXED** ✅ | Implemented in `Compiler.rs` with stack safety. |
| **RUST-STMT-02** | Missing `for` Loop Support | **FIXED** ✅ | Implemented using `RANGE` and `ITER_NEXT`. |
| **RUST-SEC-01** | Partial Sandbox Implementation | **HARDENED** 🛡️ | `check_permission` and `safe_resolve` implemented in VM. |
| **RUST-REPL-01** | Missing Rust REPL | **FIXED** ✅ | Integrated `rustyline` with multi-line support. |
| **RUST-LEX-01** | Underscore Token Support | **FIXED** ✅ | Added `UNDERSCORE` token for pattern matching. |

## 2. Legacy Bugs (Carried from TS Baseline)
*Note: These were fixed in TS and must be verified in the new Rust implementation.*

| ID | Bug Name | Status | Verification |
| :--- | :--- | :--- | :--- |
| **VULN-STACK-01** | Match Statement Stack Leak | **FIXED** ✅ | Verified that matched cases pop the original value. |
| **VULN-STACK-02** | Function Return Stack Leak | **VERIFIED** ✅ | Rust `RET` opcode correctly restores `old_sp`. |
| **VULN-STACK-03** | Iterator Stack Leak | **FIXED** ✅ | `for` loop now patches jump address correctly to end. |
