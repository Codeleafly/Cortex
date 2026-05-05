# Nox 🧠

A high-performance, general-purpose programming language built from scratch in TypeScript.

## Features
- **Modern Syntax:** Clean, sci-fi inspired syntax (`is`, `mut`, `fn =>`, `match`) optimized for readability and speed.
- **Numeric Bytecode VM:** Compiles source code directly into `Int32Array` bytecode for maximum execution speed.
- **Stack-Based Architecture:** Efficient execution using a numeric virtual machine.
- **Modern CLI/REPL:** Interactive REPL built with React and Ink, featuring multi-line support and dot commands.
- **Advanced Types:** Support for Strings, Booleans, Numbers, Arrays, and Null.
- **Control Flow:** `if` statements, `while` loops, `for` loops, and `match` expressions.
- **True Async:** Built-in support for asynchronous operations using the `!` operator.

## Installation
```bash
# Clone the repository
git clone https://github.com/Codeleafly/Nox.git
cd Nox

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage
### Running a file
Nox files traditionally use the `.nx` extension.
```bash
npx nox run hello.nx
```

### Interactive REPL
Simply run the `nox` command:
```bash
npx nox
```
In the REPL, you can use:
- `.help`: Show help
- `.reset`: Reset the environment
- `.exit`: Exit the REPL

## Syntax Overview

### Variables & Math
```javascript
is x = 10
mut y = 20
print (x + y) * 2 // Output: 60
```

### Strings
```javascript
is name = "Nox"
print "Hello, " + name // Output: Hello, Nox
```

### Loops
```javascript
mut i = 5
while i > 0 {
    print i
    i = i - 1
}
```

### Functions
```javascript
fn square(n) => n * n
print square(4) // Output: 16
```

### Pipe Operator
```javascript
"hello" |> str_upper |> print // Output: HELLO
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

## Contributing & Ownership
Nox is an **AI-Native project**. While **Codeleafy** is the human owner, the language is primarily developed and managed by AI agents.

- For architectural details, see [Architecture](docs/architecture.md).
- For a detailed breakdown of the package ecosystem, see [Packages](docs/packages.md).
- For syntax guidance, see [Syntax Guide](docs/syntax.md).
