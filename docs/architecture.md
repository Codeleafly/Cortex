# Cortex Architecture

Cortex is designed for maximum performance through a **Bytecode-First** approach.

## 1. One-Pass Compiler
Unlike traditional compilers that generate a heavy Object-oriented Abstract Syntax Tree (AST), the Cortex compiler performs a "one-pass" scan. It tokenizes and emits numeric bytecode directly.

## 2. Numeric Bytecode
The output of the compiler is an `Int32Array`. This is a contiguous block of memory containing numeric opcodes (e.g., `PUSH=1`, `ADD=2`). This allows the VM to execute commands with minimal overhead.

## 3. Stack-Based Virtual Machine
The VM uses a stack to perform operations.
- **Operand Stack:** Used for math and temporary values.
- **Call Stack:** Used to track return addresses for function calls.
- **Memory:** A pre-allocated array for variable storage.

## 4. Dispatcher
The VM uses a highly optimized `switch-case` loop to dispatch opcodes. By avoiding complex object lookups and property access, Cortex achieves high execution speeds in a TypeScript-based environment.
