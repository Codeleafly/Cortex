# 🚀 Nox Language Blueprint: The Future of Developer Experience

## 1. Vision Statement
Nox ek aisi language hai jo Python ki **simplicity**, TypeScript ki **flexibility**, aur Rust ki **performance** ko ek saath lati hai. Iska goal hai: "Toy jaisa shuru karo, professional jaisa scale karo."

---

## 2. Core Language Design
### A. Execution Model
*   **JIT Compiled:** Fast execution ke liye Just-In-Time compilation (LLVM/V8 internals based).
*   **Top-Level Execution:** Zero boilerplate code (koii `main` function ki compulsory zaroorat nahi beginner mode me).

### B. Syntax Levels
*   **Default Mode (Ultra-Easy):**
    - Keyword-less variable declarations (`name = "Nox"`).
    - Natural language keywords: `say` (print ke liye), `ask` (input ke liye).
    - Auto-imports: Common modules auto-load honge.
*   **Strict Mode (`!strict`):**
    - TypeScript-style Optional Typing (`name: string = "Nox"`).
    - Rust-style Pattern Matching (`match` keyword).
    - Export/Import mandatory.

---

## 3. Global Module System (Deno-Style)
### A. Remote Imports
Nox bina Package Manager ke dependencies handle karega via URLs:
*   `import { math } from "https://example.com/lib/map.nx.json"`
*   `import { helper } from "github:user/repo/map.nx.json"`
*   `import { local } from "./local.nx"`

### B. The `map.nx.json` Protocol
Ek manifest file jo complex packages ko handle karti hai:
- **Files Mapping:** Pure directory structure aur assets (images, binaries) ka map.
- **Dependency Tree:** Doosre modules ke links.
- **Integrity:** Security ke liye hashes/checksums.

---

## 4. OS-Native Global Cache
Nox dependencies ko project folder (`node_modules` style) me nahi rakhta.

*   **Location:**
    - **Linux/macOS:** `$HOME/.nox_libx/`
    - **Windows:** `%USERPROFILE%\.nox_libx\`
*   **Storage Logic:**
    - `/pkg_cache/`: Saare downloaded modules yahan store honge.
    - **Multi-version Support:** Har package version-specific folder me rahega (e.g., `math_lib/v1.0.0`, `math_lib/v2.0.0`).
    - **Deduplication:** Agar multiple projects ek hi version use karte hain, to disk par sirf ek copy hogi.

---

## 5. Integrated CLI Manager
Nox ka CLI runtime aur package manager dono ka kaam karega:

| Command | Action |
| :--- | :--- |
| `nox run <file>` | Script chalata hai, missing modules auto-detect karta hai. |
| `nox install <URL>` | Explicitly kisi module ko `$HOME/.nox_libx/` me add karta hai. |
| `nox clean` | Global cache ko wipe out karta hai. |
| `nox list` | Saare cached versions aur unki size dikhata hai. |

---

## 6. Smart Runtime Behavior
*   **Auto-Installer:** Jab runtime dekhta hai ki koi module missing hai, to wo user se terminal par permission maangega:
    > `Module 'X' missing. Download to global cache? (y/n)`
*   **Batteries Included:** Core modules (IO, FS, HTTP, JSON) in-built honge aur pre-cached rahenge.
*   **Memory Management:** Hybrid approach (ARC + High-level abstractions) taaki memory safety aur speed bani rahe.

---

## 7. Roadmap
- [x] Phase 1: JIT Runtime aur `say`/`ask` primitives ka implementation.
- [ ] Phase 2: Global `$HOME/.nox_libx/` structure aur networking (fetch).
- [ ] Phase 3: `map.nx.json` parsing aur versioning logic.
- [ ] Phase 4: `!strict` mode aur Optional Typing engine.

---

# 🚀 The Nox Language Specification (Ultra-Detailed Blueprint)

## 1. Core Philosophy & Design DNA
Nox ko **"Progressive Complexity"** ke liye design kiya gaya hai.
*   **Beginner Level:** Python se bhi easy, natural language keywords, no setup.
*   **Intermediate Level:** JS/TS jaisa asynchronous aur modular power.
*   **Expert Level:** Rust jaisa memory-safe aur high-performance patterns.

---

## 2. Syntax & Execution Levels
Nox ka parser teen alag-alag moods me kaam kar sakta hai:

### A. Default Mode (The "Easy" Mode)
*   **No Boilerplate:** `main()` function ki zaroorat nahi.
*   **Natural Keywords:**
    *   `say "text"` -> `print()` ka replacement.
    *   `ask "prompt"` -> `input()` ka replacement.
*   **Variable Declaration:** Seedha `name = "Nox"` (Implicit `let`).
*   **Auto-Inference:** Background me engine automatically types decide karta hai (Deno/V8 style).

### B. Strict Mode (The "Safety" Mode)
Script ke top par `!strict` likhne se ye restrictions active ho jayengi:
*   **Explicit Typing:** `age: int = 25` (Bina type ke error dega).
*   **Immutable by Default:** Variables ko change karne ke liye `mut` keyword (Rust style) lagega: `mut count = 1`.
*   **Strict Imports:** Har module ko explicitly import karna hoga.

---

## 3. Global Cache System: `.nox_libx`
Nox ka module management "Local-First" nahi balki **"Global-Always"** hai.

### A. OS Home Integration
Ye modules ko individual project folders me install nahi karta (No `node_modules`).
*   **Linux/macOS Path:** `/home/user/.nox_libx/`
*   **Windows Path:** `C:\Users\user\.nox_libx\`

### B. The Internal Structure
```text
.nox_libx/
├── bin/            # Nox executable binaries aur globally installed tools.
├── std/            # Pre-installed standard libraries (io, fs, http, json).
├── pkg_cache/      # Third-party libraries ka main hub.
│   ├── [github.com/](https://github.com/)
│   │   └── user_name/
│   │       └── repo_name/
│   │           ├── v1.0.0/    # Unique Version 1
│   │           └── v2.1.5/    # Unique Version 2
└── metadata/       # Cache logs aur checksum hashes (security ke liye).
```

---

## 4. The `map.nx.json` Protocol (Deep Dive)
Direct URL import me sirf ek file aati hai, lekin Nox **"Smart Mapping"** use karta hai.

*   **Problem:** `import "url/math.nx"` sirf ek file lata hai, assets (images/configs) nahi.
*   **Nox Solution:** `import "url/map.nx.json"`.
    - Nox pehle is JSON ko read karega.
    - Isme likhi saari related files aur dependencies ko scan karega.
    - Pure package ko ek baar me download karke version-specific folder me rakhega.
*   **Key Features of Map:**
    - `main`: Entry point file.
    - `assets`: Binary files ya static images ke paths.
    - `integrity`: `sha256` hashes har file ke liye (Security).

---

## 5. Smart CLI & Runtime Logic
Nox ka CLI sirf compiler nahi, ek intelligent manager hai.

### A. The "Auto-Install" Loop
Jab aap `nox run script.nx` karte ho:
1.  **Scanner:** Compiler dekhta hai ki `import "github:user/lib"` likha hai.
2.  **Lookup:** `$HOME/.nox_libx/pkg_cache/` me check karta hai.
3.  **Prompt:** Agar nahi milta, to user se terminal par pucha jata hai:
    `[Nox] Package 'lib' missing. Install? (y/n):`
4.  **Action:** 'y' dabane par download shuru hota hai aur cache me save ho jata.

### B. Multi-Version Support
Nox ka runtime ek hi script me `lib@v1` aur `lib@v2` ko handle kar sakta hai bina kisi naming conflict ke. Ye version-isolation ke zariye kaam karta hai.

---

## 6. High-Performance Features (Expert)
*   **JIT Engine:** Code ko machine level par compile karne ke liye Just-In-Time compiler.
*   **Module System:** Pure Deno style (URL based), lekin support karega:
    - `https://`
    - `http://`
    - `github:user/repo` (Shorthand)
    - `./file` (Local)
*   **Package Manager CLI:** `nox install <source>` command jo direct global cache me build karta hai.

---

## 7. Technical Workflow Example
Agar user ko ek web server banana hai:

```rust
// Nox Code (Default Mode)
import server from "github:nox-org/web@v1.2.0"

app = server.create()

app.get("/", fn: say "Welcome to Nox!")

app.start(8080)
```

**Background Process:**
1. Nox dekhta hai `github:nox-org/web@v1.2.0`.
2. Check karta hai OS home folder me version `v1.2.0` hai ya nahi.
3. Agar hai, to memory me load karta hai.
4. JIT engine code ko execute karta hai.
5. Zero installation delay for the user!

---

## 8. Summary Table of Comparisons

| Feature | Python | JS/TS (Node/Deno) | Nox |
| :--- | :--- | :--- | :--- |
| **Simplicity** | High | Medium | **Ultra-High** |
| **Types** | Dynamic | Optional (TS) | **Optional (Gradual)** |
| **Packages** | pip (Local/Global) | npm (Local) | **Global Home Cache** |
| **Imports** | Package Name | Path/URL | **URL + Map.json** |
| **Speed** | Slow (Interpreted) | Fast (V8) | **Fast (JIT/LLVM)** |
