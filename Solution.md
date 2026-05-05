# Nox Solution Ledger
**Official Ledger for Technical Fixes**

This document tracks the solutions implemented for every bug identified in `Bug.md`.

## 1. Documented Solutions

| ID | Bug Name | Status | Solution Description |
| :--- | :--- | :--- | :--- |
| **BUILD-01** | Broken Internal Imports | [x] | Fixed `tsconfig` path mapping and `index.ts` exports. |
| **ARCH-01** | Missing Parser Stage | [x] | Formal `Parser.ts` and `AST.ts` implemented in Frontend. |
| **TEST-01** | Misplaced VM Tests | [x] | Tests moved from `cli` to `@nox/runtime` package. |
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
| **VULN-COMP-03** | Logic Prefix Operator Bug | [x] | Prefix `!` now correctly emits `Opcode.NOT` instead of `Opcode.AWAIT`. |
| **VULN-VM-SEC-04** | `addWhitelist` Resolution | [x] | `VM.addWhitelist` now uses `path.resolve` to match `checkPermission` behavior. |
| **VULN-TEST-02** | Async Test Desync | [x] | All integration and repro tests updated to use `await vm.run()`. |
| **VULN-DIAG-01** | Snippet Line Offset | [x] | `ErrorHandler.tsx` adjusted to show exactly 10 lines (5 before, 4 after). |
| **VULN-LEX-01** | Missing Relational Operators | [x] | Added GT_EQ and LT_EQ tokens and opcodes across pipeline. |
| **VULN-STACK-01** | Match Statement Stack Leak | [x] | Refactored compiler to ensure match value is popped in all branches. |
| **VULN-STACK-02** | Function Return Stack Leak | [x] | Implemented caller-recorded stack pointer restoration on return. |
| **VULN-STACK-03** | Iterator Stack Leak | [x] | Throw RuntimeError for non-iterables in `for` loops. |

## 2. Detailed Solutions

### [VULN-LEX-01] Missing Relational Operators (>=, <=)
...

### [VULN-STACK-01] Match Statement Stack Leak
**Status:** FIXED ✅

**Description:**
`match` statements leaked the expression value on the stack if a case matched.

**Fix Details:**
The compiler emitted a `POP` after the cases, but matched cases jumped past it to the end of the statement. The solution was to capture the address of the `POP` instruction and ensure all `endJumps` from case bodies point to it instead of the instruction after it.

### [VULN-STACK-02] Function Return Stack Leak
**Status:** FIXED ✅

**Description:**
Function calls could leak intermediate stack values if they returned early or left artifacts.

**Fix Details:**
- `VMState` was updated to store `oldSp` (stack pointer) in each `callStack` frame.
- `Opcode.CALL` records the stack pointer minus argument count as `oldSp`.
- `Opcode.RET` pops the return value, resets `state.stack.length` to `oldSp`, and then pushes the return value back.
- This ensures that every function call leaves exactly one value on the stack, regardless of internal branching or loops.

### [VULN-STACK-03] Iterator Stack Leak
**Status:** FIXED ✅

**Description:**
`for` loops on non-iterable values leaked the value on the stack because `ITER_NEXT` would jump to the end of the loop without popping the iterator.

**Fix Details:**
Updated `packages/runtime/src/vm/opcodes/data_async.ts` to explicitly pop the iterator and throw a `RuntimeError` if the value is not a `RangeIterator`. This prevents stack accumulation and provides better diagnostic feedback.
