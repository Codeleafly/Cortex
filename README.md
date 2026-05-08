# Nox 🧠

A high-performance, general-purpose programming language built from scratch in Rust.

## Features (v1.0.1 Blueprint)
- **Ultra-Modern Syntax:** Clean, beginner-friendly syntax (`say`, `ask`, keyword-less variables) that scales to Rust-level safety.
- **Numeric Bytecode VM:** Compiles source code directly into 64-bit numeric bytecode for maximum performance.
- **Stack-Based Architecture:** Efficient execution using a numeric virtual machine.
- **Modern CLI/REPL:** Interactive REPL built with Rust and `rustyline`, featuring multi-line support.
- **Deno-Style Modules:** Import directly from URLs (Phase 11 roadmap).
- **Global Smart Cache:** No `node_modules`. All dependencies stored in `$HOME/.nox_libx/`.

## Installation
```bash
# Clone the repository
git clone https://github.com/Codeleafly/Nox.git
cd Nox

# Build the project
cargo build --release
```

## Usage
### Running a file
```bash
./target/release/nox run hello.nx
```

### Interactive REPL
Simply run the `nox` command:
```bash
./target/release/nox
```
In the REPL, you can use:
- `.help`: Show help
- `.reset`: Reset the environment
- `.exit`: Exit the REPL

## Syntax Overview (Default Mode)

### Variables & Output
```javascript
name = "Nox"
say "Hello " + name
```

### Asking for Input
```javascript
name = ask "What is your name? "
say "Welcome, " + name
```

### Loops
```javascript
for i in 1..5 {
    say i
}
```

### Pattern Matching
```javascript
match x {
    1 => say "one"
    _ => say "other"
}
```

## Verification
After making changes, run:
```bash
cargo test
cargo check
```

## Contributing & Ownership
Nox is an **AI-Native project**. While **Codeleafy** is the human owner, the language is primarily developed and managed by AI agents.

- For the full blueprint, see [PLAN.md](PLAN.md).
- For syntax details, see [docs/syntax.md](docs/syntax.md).
