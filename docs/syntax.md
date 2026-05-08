# Nox Syntax Guide (v1.0.1 Blueprint)

Nox ko **"Progressive Complexity"** ke liye design kiya gaya hai. Isme teen alag-alag moods hain: **Default**, **Intermediate**, aur **Expert**.

---

## 1. Default Mode (Ultra-Easy)
Beginners ke liye seedha aur saaf syntax.

### A. Variable Declaration
Nox me variables declare karne ke liye kisi keyword ki zaroorat nahi hai.
```javascript
name = "Nox"
age = 25
```

### B. Natural Keywords
`print()` aur `input()` ki jagah natural language keywords use hote hain:
```javascript
say "Hello World"
answer = ask "What is your name?"
say "Hello " + answer
```

---

## 2. Strict Mode (`!strict`)
Agar aapko safety aur explicit typing chahiye, to file ke top par `!strict` add karein.

```javascript
!strict

is name: string = "Nox"
mut count: int = 1
```

Restrictions in Strict Mode:
- Explicit typing mandatory.
- Immutable by default (use `mut` for changes).
- Strict imports mandatory.

---

## 3. Functions (fn)
Functions dono arrow aur block syntax support karte hain.

### A. Arrow Functions
```javascript
fn square(n) => n * n
```

### B. Anonymous Functions (Blueprint style)
```javascript
app.get("/", fn: say "Welcome!")
```

---

## 4. Global Module System (Deno-Style)
Nox me `node_modules` nahi hote. Dependencies URLs se aati hain.

```javascript
import { math } from "https://nox-lib.io/math/map.nx.json"
import helper from "github:user/repo/map.nx.json"
```

---

## 5. Control Flow
### A. Pattern Matching
```rust
match value {
    1 => say "one"
    2 => say "two"
    _ => say "other"
}
```

### B. Loops
```javascript
for i in 1..10 {
    say i
}
```

---

## 6. Power Features
- **Pipe Operator (`|>`)**: `data |> process |> say`
- **Safe Call (`?.`)**: `user?.address?.city`
- **Short-hand Async (`!`)**: `data = fetch(url)!`
