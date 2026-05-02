# Cortex CLI & REPL Guide

Cortex provides a modern, interactive CLI built with **React** and **Ink**.

## Global Command
If you have run `npm link`, you can use the `cortex` command from anywhere.

## Interactive REPL
To start the REPL, simply run:
```bash
cortex
```

### REPL Commands (Dot Commands)
- `.help`: Displays available commands and syntax.
- `.reset`: Clears the VM memory and compiler state, resetting the environment.
- `.editor`: Toggles multi-line editor mode (manually enables continuation prompt).
- `.exit`: Gracefully exits the REPL.

### Advanced Multi-line Detection
Cortex REPL features intelligent multi-line detection. If you enter an incomplete code block (e.g., an unclosed `{` for a function or loop, or an open `(`), the REPL will automatically switch to a continuation prompt (`... `). It will continue to collect lines until the block is complete before executing the entire chunk.

## Running Files
To execute a Cortex script, pass the file path as an argument.
```bash
cortex my_script.ctx
```
*Note: While any extension works, `.ctx` is the recommended standard.*

### Permission Flags
By default, Cortex scripts run in a sandbox with no access to the filesystem or shell. Use the following flags to grant permissions:

- `--allow-read`: Allow reading files.
- `--allow-write`: Allow writing files.
- `--allow-run`: Allow executing shell commands.
- `--allow-all`: Grant all permissions.
- `--allow=read,write`: Grant specific comma-separated permissions.

**Example:**
```bash
cortex --allow-read --allow-write log_processor.ctx
```
