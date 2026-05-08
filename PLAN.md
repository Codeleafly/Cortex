# Nox Future Roadmap & Plan (Phase 11+)

This document outlines the high-level roadmap for the next major evolution of the Nox programming language. This file serves as a temporary, human-readable blueprint for developers and users.

> **AI Note:** AI Agents should use the internal `Plan Mode` tool for managing state and task tracking. This `PLAN.md` file is strictly for human consumption and project visibility on GitHub.

## 1. Ultra-Modern Module System (Deno-Style)
Nox will abandon the traditional `node_modules` approach in favor of a secure, URL-based module resolution system.

- **Direct Imports:** Import packages directly from HTTP/HTTPS URLs or local paths.
  ```javascript
  import { fastMath } from "https://nox-lib.io/math/map.nx.json"
  import { localHelper } from "./utils/helper.nx"
  ```
- **Smart Mapping (`map.nx.json`):** Instead of downloading a single file, Nox will fetch a map file that defines the entire package structure, its assets (like `.so` or `.dll` binaries), and its dependencies.

## 2. Global Smart Caching & Storage
To prevent "Dependency Hell" and save disk space, all modules will be stored globally on the OS.

- **Storage Location:** 
  - Linux/macOS: `$HOME/.nox_libx/`
  - Windows: `%USERPROFILE%\.nox_libx\`
- **Immutable Cache:** Once a module is downloaded, it is stored in an immutable, versioned hash-folder (e.g., `.nox_libx/pkg_cache/github.com/user/math_lib/v1.0.0/`).
- **Deduplication:** If multiple projects require `math_lib@v1.0.0`, it is only downloaded once. Projects simply link to the global cache.

## 3. Multi-Version Support
Nox will support running multiple versions of the same package without conflict.
- **Specific Version Import:** `import { add } from "github:user/math_lib@v1.0.0"`
- **Semantic Versioning:** `import { sub } from "github:user/math_lib@^1.0.0"`

## 4. Smart CLI & Auto-Installer
The `nox` CLI will be heavily upgraded to act as an integrated package manager.

- **Runtime Prompt:** If a script is executed and a dependency is missing, the runtime pauses and asks the user for permission to download and install it into the global cache.
- **Explicit Commands:**
  - `nox install <url>`: Install a package to the global cache.
  - `nox clean`: Wipe the `.nox_libx` cache.
  - `nox list`: Show installed packages.

## 5. Optional Static Typing
Nox will remain beginner-friendly (Python-like) but will introduce TS/Rust-inspired optional static typing for production safety.

```javascript
// Simple Function
fn greet(name) { print name }

// Type-Safe Function
pub fn add(a: int, b: int) -> int {
    return a + b
}
```