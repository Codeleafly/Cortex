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
- `.exit`: Gracefully exits the REPL.

### Multi-line Support
The REPL automatically detects incomplete code blocks (e.g., unmatched `{` or `(`). It will prompt with `...` until the block is closed, allowing you to write complex functions or loops directly in the terminal.

## Running Files
To execute a Cortex script, pass the file path as an argument.
```bash
cortex my_script.ctx
```
*Note: While any extension works, `.ctx` is the recommended standard.*
