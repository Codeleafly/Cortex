# Nox Technical Remediation Ledger (ULTRA-FIX)
**Author:** Cyber (Sentinel Prime)

## 1. Security Patches & Solutions

### VULN-ULTRA-01: Host Command Injection
**Fix:** Replace `sh -c` with a direct call to the executable using `Command::new`. Implement a whitelist of allowed binaries.
```rust
// Proposed fix in io.rs
let output = Command::new("ls") // Hardcoded or whitelisted
    .arg(arg_str)
    .output();
```

### VULN-ULTRA-02: Path Traversal
**Fix:** Ensure `safe_resolve` never returns a path that hasn't been canonicalized against the sandbox root.
```rust
// Proposed fix in state.rs
let resolved = fs::canonicalize(&full_path)?;
if !resolved.starts_with(&self.root_dir) {
    return Err("Sandbox Escape Detected");
}
```

### VULN-ULTRA-03: Stack Overflow (JSON)
**Fix:** Replace recursive JSON conversion logic in `network.rs` with an iterative approach using `Vec<Task>`.

### VULN-ULTRA-04: VM Stack Leak
**Fix:** The VM must pop exactly `arg_count` elements for EVERY built-in function call, or the compiler must emit `POP` instructions.

### VULN-ULTRA-05: Memory OOM
**Fix:** Implement `MAX_MEMORY_LIMIT` (e.g., 1MB) in `ensure_memory` and `ensure_globals`.
```rust
if addr > 1_000_000 { panic!("Memory Limit Exceeded"); }
```

### VULN-ULTRA-09: Safe Enum Conversion
**Fix:** Remove `unsafe { transmute(val) }`. Use a safe `match` or `TryFrom` trait.

### VULN-ULTRA-13 & 14: Modernize Stdlib & Add Brackets
**Fix:** Refactor `std/sys/mod.nx` to use `is` and `mut`. Update Lexer and `TokenType` to support `[` and `]`, and implement `DICT_BUILD` or `ARRAY_BUILD` opcodes correctly.

### VULN-ULTRA-15 & 22: Unify Parser Keywords
**Fix:** Ensure all built-in function names are treated as identifiers in the lexer, OR add them to the parser's `primary()` expression list so they can be parsed as callable expressions.

### VULN-ULTRA-16: CALL Guard
**Fix:** Add check in `Opcode::CALL` to ensure `state.stack.len() >= arg_count`.

### VULN-ULTRA-17: Canonical Whitelist Check
**Fix:** Always canonicalize paths before performing `.starts_with()` checks against the whitelist. Never trust raw absolute paths from user input.

### VULN-ULTRA-18: JSON Array Support
**Fix:** Update `json_to_stack` and `stack_to_json` to support recursive `Vec<StackValue>` (requires adding `Array` variant to `StackValue`).

### VULN-ULTRA-19 & 34: Network/System Permissions
**Fix:** Introduce `Permissions::network` and `Permissions::system`. Add `check_permission` calls to `HTTP_GET` and `OS_INFO`.

### VULN-ULTRA-20 & 25: Depth-Limited Recursion
**Fix:** Implement a `max_depth` counter in recursive VM operations (`clone`, `PartialEq`, JSON serialization) to prevent host stack exhaustion.

### VULN-ULTRA-21: Unicode-Safe STR_AT
**Fix:** Use `.chars().count()` for bounds checking or perform a safe `nth()` check and return `Null` if `None`.

### VULN-ULTRA-24: Linker Initialization Fix
**Fix:** The Linker should emit a call to each module's entry point instead of a single `JMP` to the main module, or the main module should be responsible for calling imported initialization blocks.

### VULN-ULTRA-26 & 27: Method Call Implementation
**Fix:** Update Parser to support `Expr::MethodCall` and Compiler to emit `Opcode::LOAD` + `Opcode::CALL`.

### VULN-ULTRA-28 & 30: Async IO & Resource Accounting
**Fix:** Use `tokio::process::Command` for non-blocking execution and implement a "gas" model where expensive operations (string manipulation, IO) increment the instruction count proportionally to their cost.

### VULN-ULTRA-29: VM State Isolation
**Fix:** Explicitly `clear()` or re-initialize the `memory` and `globals` vectors in `VM::run`.

### VULN-ULTRA-31: REPL Sandbox
**Fix:** Wrap the `vm.run` call in `std::panic::catch_unwind` or use a separate worker thread/process for script execution to protect the REPL shell.

### VULN-ULTRA-32 & 33: Bytecode Validation
**Fix:** Implement a robust validation pass before execution that checks all stack operations and pool indices for safety.

## 2. Architectural Recommendations
- **Capability-Based Security:** Switch from flat permissions to granular resource handles.
- **Strict Bytecode Validation:** Add a pre-execution pass to verify all JMP targets and stack effects.
