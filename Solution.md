# Cortex Solution Ledger
**Official Ledger for Technical Fixes**

This document tracks the solutions implemented for every bug identified in `Bug.md`.

## 1. Documented Solutions

| ID | Bug Name | Status | Solution Description |
| :--- | :--- | :--- | :--- |
| **BUILD-01** | Broken Internal Imports | [x] | Fixed `tsconfig` path mapping and `index.ts` exports. |
| **ARCH-01** | Missing Parser Stage | [x] | Formal `Parser.ts` and `AST.ts` implemented in Frontend. |
| **TEST-01** | Misplaced VM Tests | [x] | Tests moved from `cli` to `@cortex/runtime` package. |
| **VULN-COMP-01** | Missing Stack Frames | [x] | VM now uses Base Pointer (`bp`) for local relative addressing. |
| **VULN-VM-01** | Unbounded Memory Access | [x] | Explicit checks added to `LOAD` and `STORE` opcodes. |
| **VULN-RULE-01** | `any` Type Violation | [x] | Replaced with `StackValue` union and Type Guards. |
| **VULN-VM-03** | Missing Stack Guardrails | [x] | Stack limits (1024) and push/pop checks implemented. |
| **VULN-VM-04** | Top-Level Return Crash | [x] | `RuntimeError` thrown on invalid `RET`. |
| **VULN-REPL-01** | Unhandled REPL Commands | [x] | `.editor` command logic implemented in `Repl.tsx`. |
| **VULN-VM-DoS-01** | Unbounded Call Stack | [x] | 256-frame depth limit enforced in `CALL` opcode. |
| **VULN-VM-LOGIC-01** | Memory Pointer Squeeze | [x] | Memory stack pointer isolation for globals implemented. |
| **VULN-VM-DATA-01** | Truncated Bytecode Read | [x] | `readOperand()` with length safety added to VM. |
| **VULN-CTX-01** | Global/Local Collision | [x] | Dedicated `globals` array isolation implemented in VM. |
| **VULN-CTX-02** | Stack Desynchronization | [x] | Implicit `PUSH null` added to all functions in Compiler. |
| **VULN-VM-SEC-01** | Path Traversal Escape | [x] | `safeResolve` sandbox isolation implemented in VM. |
| **VULN-VM-SEC-02** | Symlink Sandbox Escape | [x] | Added `fs.realpathSync` check to `safeResolve`. |
| **VULN-COMP-02** | Scope Resolution Mismatch | [x] | Corrected `resolveVariable` to handle globals in top-level blocks. |
| **VULN-LOGIC-01** | Non-Short-Circuiting | [x] | Implemented `JMP_IF_TRUE` and conditional logic jumps. |
| **VULN-LOGIC-02** | Operator Precedence | [x] | Refactored Parser to separate equality from comparison. |
| **OPT-COMP-01** | Memory Fragmentation | [x] | Block-level memory reclamation implemented in Compiler. |
| **VULN-NEW-01** | Sandbox Escape via Prefix Bug | [x] | Fixed `safeResolve` using `path.relative` to ensure path containment. |
| **VULN-NEW-02** | Permanent Permission Escalation | [x] | Implemented granular path-based whitelisting for permissions. |
| **VULN-NEW-03** | Broken Nested Function Scope | [x] | Compiler now throws error on closure access to prevent corruption. |
| **VULN-NEW-04** | Integer Overflow in Bytecode | [x] | Added 32-bit signed range validation for numeric literals in Compiler. |
| **VULN-CYBER-01** | Logical Op Value Retention | [x] | Introduced `Opcode.DUP` to retain truthy/falsey values in `&&` and `||`. |
| **VULN-CYBER-02** | Path-Specific Permissions | [x] | CLI and VM updated to support granular `--allow-read=/path` whitelisting. |
| **VULN-CYBER-03** | Shell Injection Hardening | [x] | Added metacharacter blacklist to `RUN_CMD` opcode in VM. |
| **VULN-CYBER-04** | REPL Stack accumulation | [x] | `runSnippet` now clears operand stack on error to prevent state leaks. |
| **VULN-REPL-02** | REPL Log Loss on Error | [x] | Updated `Repl.tsx` to collect logs even when a snippet throws an error. |
| **VULN-VM-LOGIC-02** | Value-Destructive Logic Ops | [x] | Updated `Opcode.AND` and `Opcode.OR` in VM to be value-preserving (JS-style). |
| **VULN-VM-SEC-03** | Broken `RUN_CMD` Whitelist | [x] | Updated VM to extract and verify the executable path for permissions, ignoring arguments. |
