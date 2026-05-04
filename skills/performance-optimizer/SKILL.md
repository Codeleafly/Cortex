---
name: performance-optimizer
description: Guardrails and techniques for maintaining the 'Bytecode-First' purity and execution speed of the Nox engine. Use this when refactoring core VM logic or adding high-impact opcodes.
license: MIT
metadata:
  version: "1.1.0"
---

# Performance Optimizer Skill

This skill ensures that Nox remains a high-performance engine by adhering to strict numeric bytecode standards.

## Optimization Guardrails

### 1. Bytecode Locality
- Always use `Int32Array` for bytecode storage.
- Prefer inline numeric values over object-based structures in the execution loop.

### 2. VM Dispatcher Speed
- Keep the `execute()` method's `switch-case` lean. 
- Avoid allocating objects inside the main loop; reuse buffers where possible.

### 3. Type Safety without Overhead
- Use TypeScript's narrowing (Type Guards) to handle the `StackValue` union efficiently.
- Never use `as any`, as it bypasses the safety checks that help the V8 engine optimize the code.

## Verification
- Run the `fib.nx` benchmark script.
- Ensure no significant regressions in execution time for large loops.
