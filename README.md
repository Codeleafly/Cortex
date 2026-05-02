# Cortex 🧠

A high-performance, general-purpose programming language built from scratch in TypeScript.

## Features
- **Hybrid Syntax:** JavaScript-like structure (`let`, `fn`, `{}`) with Python-like simplicity (`print`).
- **Numeric Bytecode VM:** Compiles source code directly into `Int32Array` bytecode for maximum execution speed.
- **Stack-Based Architecture:** Efficient execution using a numeric virtual machine.
- **Modern CLI/REPL:** Interactive REPL built with React and Ink, featuring multi-line support and dot commands.
- **Advanced Types:** Support for Strings, Booleans, Numbers, and Null.
- **Control Flow:** `if` statements, `while` loops, and function declarations (`fn`).

## Installation
```bash
# Clone the repository
git clone https://github.com/Codeleafly/Cortex.git
cd Cortex

# Install dependencies
npm install

# Build and link globally
npm run build && npm link
```

## Usage
### Running a file
Cortex files traditionally use the `.ctx` extension.
```bash
cortex hello.ctx
```

### Interactive REPL
Simply run the `cortex` command without arguments:
```bash
cortex
```
In the REPL, you can use:
- `.help`: Show help
- `.reset`: Reset the environment
- `.exit`: Exit the REPL

## Syntax Overview

### Variables & Math
```javascript
let x = 10;
let y = 20;
print (x + y) * 2; // Output: 60
```

### Strings
```javascript
let name = "Cortex";
print "Hello, " + name; // Output: Hello, Cortex
```

### Loops
```javascript
let i = 5;
while (i > 0) {
    print i;
    i = i - 1;
}
```

### Functions
```javascript
fn square(n) {
    return n * n;
}
print square(4); // Output: 16
```

### Comments
```javascript
// Single-line comment
/* 
   Multi-line
   comment
*/
```


## Verification
After making changes, run:
```bash
npm run clean
npm run build
npm run test
```

For faster local iteration (without the full pre-build test flow), use:
```bash
npm run test:watch
```

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute. This project is AI-led and follows strict architectural standards.

## License
MIT License (c) 2026 Codeleafly. Full developmental control is retained by AI agents. See [LICENSE](LICENSE) for details.
