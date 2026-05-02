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
- **Comparison:** `>`, `<`, `==`, `!=`
- **Logical:** `&&` (AND), `||` (OR), `!` (NOT) - *Supports full short-circuiting (lazy evaluation).*

## Control Flow
### If/Else Statements
```javascript
if (x > 10) {
    print "High";
} else {
    print "Low";
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
- `arg_count()`: Number of arguments passed to the script.
- `get_arg(index)`: Returns the argument at the specified index as a string.
- `to_number(string)`: Converts a string to a numeric integer.
- `read_line()`: Reads a line of input from the user (blocks until Enter is pressed).
- `read_file(path)`: Reads the content of a file. Returns `null` if the file doesn't exist or cannot be read.
- `write_file(path, content)`: Writes content to a file. Returns `1` on success, `0` on failure.
- `file_exists(path)`: Returns `1` if the file exists within the workspace, `0` otherwise.
- `str_upper(string)`: Returns the uppercase version of the string.
- `str_words(string)`: Returns the number of words in the string.
- `str_at(string, index)`: Returns the character at the given index, or `null` if out of bounds.
- `str_len(string)`: Returns the length of the string.
- `run_command(command)`: Executes a shell command and returns its stdout. Requires `run` permission.

```javascript
if (arg_count() > 0) {
    let path = get_arg(0);
    if (file_exists(path)) {
        let content = read_file(path);
        print str_upper(content);
        print "Words: " + str_words(content);
    }
}
```

## Security & Permissions
Cortex implements a granular permission system inspired by Deno. Sensitive operations (file access, command execution) require explicit permission. In interactive mode, Cortex will prompt the user if a permission is missing. In non-interactive mode, it will throw a security error.

See the [CLI Guide](cli.md) for more details on permission flags.
