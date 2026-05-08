# Nox CLI & REPL Guide

Nox provides a modern, interactive CLI built in **Rust**.

## Global Command
If you have installed Nox globally (e.g., using a `.msi` or `.deb` release, or via `cargo install --path packages/cli`), you can use the `nox` command from anywhere.

## Interactive REPL
To start the REPL, simply run:
```bash
nox repl
```
*(Or use `cargo run --package nox -- repl` during development)*

### REPL Commands (Dot Commands)
- `.help`: Displays available commands and syntax.
- `.reset`: Clears the VM memory and compiler state, resetting the environment.
- `.editor`: Toggles multi-line editor mode (manually enables continuation prompt).
- `.exit`: Gracefully exits the REPL.

### Advanced Multi-line Detection
Nox REPL features intelligent multi-line detection. If you enter an incomplete code block (e.g., an unclosed `{` for a function or loop, or an open `(`), the REPL will automatically switch to a continuation prompt (`... `). It will continue to collect lines until the block is complete before executing the entire chunk.

## Running Files
To execute a Nox script, pass the file path as an argument.
```bash
nox run my_script.nx
```
*(Or use `cargo run --package nox -- run my_script.nx` during development)*
*Note: While any extension works, `.nx` is the recommended standard.*

### Permission Flags
By default, Nox scripts run in a sandbox with no access to the filesystem or shell. Use the following flags to grant permissions:

- `--allow-read`: Allow reading files.
- `--allow-write`: Allow writing files.
- `--allow-run`: Allow executing shell commands.
- `--allow-all`: Grant all permissions.
- `--allow=read,write`: Grant specific comma-separated permissions.

**Example:**
```bash
nox run --allow-read --allow-write log_processor.nx
```
