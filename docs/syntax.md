# Cortex Syntax Guide

Cortex uses a **Hybrid JS/Python Syntax**. It combines the structural clarity of JavaScript with the concise built-ins of Python.

## Variables
Use `let` to declare variables. Assignments can be made directly after declaration.
```javascript
let x = 10;
x = 20; // Re-assignment
```

## Data Types
- **Numbers:** Integers (e.g., `10`, `-5`)
- **Strings:** Double or single quoted (e.g., `"hello"`, `'world'`)
- **Booleans:** `true`, `false`
- **Null:** `null`

## Math & Operators
- **Arithmetic:** `+`, `-`, `*`, `/`
- **Comparison:** `>`, `<`, `==`
- **Logical:** `&&` (AND), `||` (OR), `!` (NOT)

## Control Flow
### If Statements
```javascript
if (x > 10) {
    print "High";
}
```

### While Loops
```javascript
let i = 5;
while (i > 0) {
    print i;
    i = i - 1;
}
```

## Functions
Declare functions using the `fn` keyword.
```javascript
fn greet(name) {
    print "Hello, " + name;
}

greet("Cortex");
```

## Comments
```javascript
// Single-line comment
/* 
   Multi-line
   comment
*/
```

## CLI Built-ins (Global)
Cortex provides built-in primitives for building CLI applications.
- `arg_count`: Number of arguments passed to the script.
- `get_arg(index)`: Returns the argument at the specified index as a string.
- `to_number(string)`: Converts a string to a numeric integer.

```javascript
if (arg_count > 0) {
    let first = to_number(get_arg(0));
    print first + 10;
}
```
