# [2025-05-14] Log Entry 01: Deep Security, Logic, and Documentation Audit
**Agent Identity:** Cyber

### 1. User Instructions (Directives)
*   **Request:** Perform a deep-level security, logic, and documentation audit of the Cortex project.
*   **Constraints:** Zero-litter policy (use `tests/` for repros), follow logging standards, ensure all 19 tests pass.

### 2. Technical Implementation Details
*   **Architecture Changes:** 
    *   Implemented short-circuiting for logical operators (`&&`, `||`) by introducing `Opcode.JMP_IF_TRUE` and updating the `Compiler` to emit conditional jumps.
    *   Corrected operator precedence in the `Parser` by separating relational operators (`>`, `<`) and equality operators (`==`, `!=`).
*   **Files Modified:** 
    *   `packages/shared/src/opcodes.ts`
    *   `packages/runtime/src/vm/VM.ts`
    *   `packages/frontend/src/compiler/Compiler.ts`
    *   `packages/frontend/src/parser/Parser.ts`
    *   `docs/syntax.md`
    *   `docs/cli.md`
*   **Logic Forensics:** 
    *   Short-circuiting is a fundamental expectation in modern languages. The previous implementation evaluated both sides of logical expressions, which could lead to unexpected side effects or performance issues.
    *   Operator precedence was non-standard (Equality having same precedence as Relational), causing incorrect evaluation of expressions like `0 == 1 < 2`.

### 3. Error Recovery & Course Corrections (Self-Audit)
*   **Mistakes Identified:** Initial attempt to use `ts-node` failed because it wasn't available in the environment.
*   **Remediation:** Switched to building the project with `npm run build` and running with `node`, which is the standard workflow for this workspace.

### 4. Final Verification
*   **Tests Run:** `npm test`, `tests/repro_deep_audit_logic.ctx`, `tests/repro_deep_audit_precedence.ctx`.
*   **Success Criteria:** All 19 existing tests passed, and new reproduction scripts verified the fixes for short-circuiting and operator precedence.

**Status:** Complete, Hardened
**Author:** Cyber

---

# [2026-05-03] Log Entry 02: Phase 5 Deep Security & Logic Audit
**Agent Identity:** Cyber

### 1. User Instructions (Directives)
*   **Request:** Perform a deep-level security, logic, architectural, and standard-compliance audit.
*   **Constraints:** No modification of code or general documentation (only `Bug.md`), zero-litter policy, empirical verification in `tests/`.

### 2. Technical Implementation Details
*   **Logic Forensics & Vulnerability Discovery:**
    - **Sandbox Security:** Identified a path traversal vulnerability (VULN-NEW-01) where `startsWith` validation could be bypassed using sibling directories.
    - **Permission Model:** Identified a global escalation bug (VULN-NEW-02) where a single granted permission persists for the lifetime of the VM.
    - **Language Semantics:** Identified a fundamental scoping failure in nested functions (VULN-NEW-03) due to lack of closure support (upvalues).
    - **Data Integrity:** Identified an integer wrap-around vulnerability (VULN-NEW-04) in the bytecode's `Int32Array` storage for large numeric literals.
*   **Files Modified:** `Bug.md`.
*   **Verification:** Created and executed reproduction scripts in `tests/repro/` (verified and cleaned up).

### 3. Conclusion
The audit reveals critical gaps in the security sandbox and the core scoping model. The project status has been downgraded to reflect these findings.

**Status:** VULNERABLE - RE-AUDIT REQUIRED
**Author:** Cyber
