# Nox Solution Ledger (v1.0.1 - Rust Hardening)

This document tracks solutions for bugs identified during the Rust modernization phase.

## 1. Rust Implementation Fixes

| ID | Bug Name | Status | Solution Description |
| :--- | :--- | :--- | :--- |
| **VULN-STACK-02** | Function Return Stack Leak | [x] | Rust `VMState` and `RET` opcode implement `old_sp` restoration. |
| **RUST-STMT-01** | Missing `match` Support | [x] | Implemented recursive jump-based matching in `Compiler.rs`. |
| **RUST-STMT-02** | Missing `for` Loop Support | [x] | Implemented iterator-based loops using `RANGE` and `ITER_NEXT`. |
| **RUST-SEC-01** | Sandbox Hardening | [x] | Implemented real path resolution and permission checking in `state.rs`. |
| **RUST-REPL-01** | Rust REPL Implementation | [x] | Integrated `rustyline` and implemented block detection. |
| **RUST-LEX-01** | Underscore Token Support | [x] | Add `UNDERSCORE` token and Lexer keyword mapping. |
| **VULN-STACK-01** | Match Stack Leak | [x] | Compiler explicitly pops match value before entering case bodies. |
| **VULN-STACK-03** | Iterator Stack Leak | [x] | Patched `ITER_NEXT` jump to go *after* the final iterator pop. |
