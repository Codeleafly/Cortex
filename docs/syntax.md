# Nox Syntax Guide (Modern Standard)

Nox uses a **Modern, Sci-Fi Syntax** designed for speed, clarity, and safety.

## 1. Variables (is vs mut)
Variables are explicit. Use `is` for constants and `mut` for mutable state.
```javascript
is name = "Nox"       // Constant (Immutable) - cannot be changed
mut score = 100       // Mutable - can be updated
score = 105           // Allowed
// name = "New"       // ERROR: Cannot re-assign a constant
```
> **Deprecation Notice:** The `let` keyword is **DEPRECATED**. Use `is` or `mut` instead.

## 2. Functions (fn)
Functions support both arrow syntax for expressions and block syntax for logic.
### Arrow Functions (1-line)
```javascript
fn square(n) => n * n
```
### Block Functions
```javascript
fn calculate(a, b) {
    is result = (a + b) * 2
    return result
}
```

## 3. Control Flow (No Parentheses)
Logic blocks use `{}` but do not require `()` for the condition.
### If/Else Statements
```javascript
if age >= 18 {
    print "User is adult"
} else {
    print "User is minor"
}
```

### Match Statement (Pattern Matching)
```rust
match status {
    200 => print "Success"
    404 => print "Not Found"
    _   => print "Unknown Error"
}
```

## 4. Loops
### For...In Loop
Iterate over arrays or ranges.
```javascript
is items = ["A", "B", "C"]
for item in items {
    print item
}

// Range loop (inclusive)
for i in 1..10 {
    print "Number: " + i
}
```

### While Loops
```javascript
mut i = 5
while i > 0 {
    print i
    i = i - 1
}
```

## 5. Power Features
### Pipe Operator (`|>`)
Chain data through functions easily.
```javascript
"hello world" |> str_upper |> print
```

### Safe Call (`?.`) & Null Coalescing (`??`)
Handle null values without crashes.
```javascript
is city = user?.address?.city ?? "Unknown"
```

### Short-hand Async (`!`)
Wait for asynchronous results (like `fetch` or `sleep`) using the `!` operator.
```javascript
is data = fetch("api/url")!
print data.json()!
```

## 6. Strings & Escapes
Strings can be enclosed in double (`"`) or single (`'`) quotes. 
### Escape Sequences
- `\n`: Newline
- `\r`: Carriage return
- `\t`: Tab
- `\\`: Backslash
- `\"`: Double quote
- `\'`: Single quote
- `\e`: **ANSI Escape code** (useful for terminal colors).

Example: `print "\e[32mSuccess\e[0m"`

## 7. Math & Operators
- **Arithmetic:** `+`, `-`, `*`, `/`
- **Comparison:** `>`, `<`, `==`, `!=`
- **Logical:** `&&` (AND), `||` (OR), `!` (NOT) - *Supports full short-circuiting.*

---

## Legacy Syntax (DEPRECATED)
The following syntax is supported for backward compatibility but is **deprecated** and should not be used in new code.
- `let x = 10;` (Use `is` or `mut`)
- `if (condition) { ... }` (Parentheses are now optional)
- `while (condition) { ... }` (Parentheses are now optional)
- Mandatory semicolons `;` (Newlines now act as terminators)
