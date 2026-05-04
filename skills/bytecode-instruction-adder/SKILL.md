---
name: bytecode-instruction-adder
description: A standardized procedure for adding new language features or opcodes to Nox. Use this when the user requests a new language capability (e.g., bitwise operators, new built-ins) that requires an engine upgrade.
license: MIT
metadata:
  version: "1.1.0"
---

# Bytecode Instruction Adder Skill

This skill ensures that new instructions are implemented consistently across all monorepo packages.

## Implementation Workflow

### 1. Define the Instruction (@nox/shared)
- Add a new entry to the `Opcode` enum in `packages/shared/src/opcodes.ts`.
- If the instruction requires a new keyword, add it to `TokenType` in `packages/shared/src/tokens.ts`.

### 2. Update the Frontend (@nox/frontend)
- **Lexer:** If a new keyword was added, update the `keywords` mapping in `Lexer.ts`.
- **Parser:** Add the new expression or statement type to `AST.ts`. Update `Parser.ts` to handle the new syntax and generate the AST node.
- **Compiler:** Update `Compiler.ts` to walk the new AST node and emit the corresponding `Opcode`.

### 3. Update the Runtime (@nox/runtime)
- Update `VM.ts`'s `execute()` method.
- Implement the logic for the new `Opcode` within the `switch-case` dispatcher.
- Ensure the stack and memory are handled without using `any`.

### 4. Verification
- Create a new integration test in `tests/ctx/` (e.g., `test_XX_feature.nx`).
- Run `npm run build` and `npm run test` from the root.

## Gotchas
- **Stack Integrity:** Always ensure that every `Opcode` pops exactly what it needs and pushes the result back.
- **Bytecode Indexing:** For instructions taking arguments (like `JMP`), remember the instruction pointer (`ip`) needs to be incremented correctly.
- **Project References:** Use `tsc -b` to build. Standard `tsc` might fail due to project references.
