---
name: performance-optimizer
description: Rules and patterns for maintaining Cortex's high-performance 'Bytecode-First' architecture. Activate this when refactoring the VM, Compiler, or performing system audits.
---

# Performance Optimizer Skill

This skill enforces engineering standards that keep the Cortex VM fast and lightweight.

## Core Rules

### 1. Bytecode Purity
- Avoid generating intermediate objects or ASTs during execution.
- Only execute numeric `Int32Array` bytecode.
- If a high-level structure is needed, store it in the `stringPool` or a similar pre-allocated heap and reference it by index.

### 2. Dispatcher Optimization
- The `switch-case` in `VM.execute()` is the heart of the language. Keep it clean.
- Minimize property lookups inside the hot loop.
- Use local variables within the `execute` method for frequently accessed state.

### 3. Type Safety as Performance
- Adhere to the **Zero-Tolerance for `any`** mandate.
- Use explicit union types for the stack (`(number | string | boolean | null)[]`).
- Types allow the TypeScript compiler to optimize better and prevent runtime "type-guessing" overhead.

### 4. Memory Locality
- Use `Int32Array` for memory and bytecode.
- Contiguous memory buffers are significantly faster than standard JS arrays for numeric operations.

## Audit Checklist
- [ ] Is there any `any` usage?
- [ ] Are we generating ASTs during `VM.run()`? (Should be forbidden).
- [ ] Can an operation be converted from a string-lookup to a numeric-index lookup?
