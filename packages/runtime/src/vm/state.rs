use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

#[derive(Debug)]
pub enum StackValue {
    Number(i64),
    String(String),
    Boolean(bool),
    Null,
    Dictionary(HashMap<String, StackValue>),
    Array(Vec<StackValue>),
    Range(i64, i64, i64), // start, end, current
}

impl Clone for StackValue {
    fn clone(&self) -> Self {
        self.safe_clone()
    }
}

impl PartialEq for StackValue {
    fn eq(&self, other: &Self) -> bool {
        fn eq_limited(a: &StackValue, b: &StackValue, depth: usize) -> bool {
            if depth > 100 { return false; }
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => a == b,
                (StackValue::String(a), StackValue::String(b)) => a == b,
                (StackValue::Boolean(a), StackValue::Boolean(b)) => a == b,
                (StackValue::Null, StackValue::Null) => true,
                (StackValue::Range(s1, e1, c1), StackValue::Range(s2, e2, c2)) => s1 == s2 && e1 == e2 && c1 == c2,
                (StackValue::Array(a), StackValue::Array(b)) => {
                    if a.len() != b.len() { return false; }
                    for (va, vb) in a.iter().zip(b.iter()) {
                        if !eq_limited(va, vb, depth + 1) { return false; }
                    }
                    true
                }
                (StackValue::Dictionary(a), StackValue::Dictionary(b)) => {
                    if a.len() != b.len() { return false; }
                    for (k, va) in a {
                        if let Some(vb) = b.get(k) {
                            if !eq_limited(va, vb, depth + 1) { return false; }
                        } else {
                            return false;
                        }
                    }
                    true
                }
                _ => false,
            }
        }
        eq_limited(self, other, 0)
    }
}

impl Eq for StackValue {}

impl StackValue {
    pub fn safe_clone(&self) -> Self {
        fn clone_limited(v: &StackValue, depth: usize) -> StackValue {
            if depth > 100 { return StackValue::Null; }
            match v {
                StackValue::Number(n) => StackValue::Number(*n),
                StackValue::String(s) => StackValue::String(s.clone()),
                StackValue::Boolean(b) => StackValue::Boolean(*b),
                StackValue::Null => StackValue::Null,
                StackValue::Range(s, e, c) => StackValue::Range(*s, *e, *c),
                StackValue::Array(arr) => {
                    let mut new_arr = Vec::with_capacity(arr.len());
                    for x in arr {
                        new_arr.push(clone_limited(x, depth + 1));
                    }
                    StackValue::Array(new_arr)
                }
                StackValue::Dictionary(dict) => {
                    let mut new_dict = HashMap::with_capacity(dict.len());
                    for (k, v) in dict {
                        new_dict.insert(k.clone(), clone_limited(v, depth + 1));
                    }
                    StackValue::Dictionary(new_dict)
                }
            }
        }
        clone_limited(self, 0)
    }
}

#[derive(Debug, Default)]
pub struct Permissions {
    pub read: bool,
    pub write: bool,
    pub run: bool,
    pub network: bool,
}

#[derive(Debug)]
pub struct CallFrame {
    pub return_addr: usize,
    pub old_bp: usize,
    pub old_sp: usize,
}

pub struct VMState {
    pub stack: Vec<StackValue>,
    pub memory: Vec<StackValue>,
    pub globals: Vec<StackValue>,
    pub ip: usize,
    pub bp: usize,
    pub memory_stack_pointer: usize,
    pub call_stack: Vec<CallFrame>,
    pub logs: Vec<String>,
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
    pub args: Vec<String>,
    pub instruction_count: usize,

    pub permissions: Permissions,
    pub whitelists: HashMap<String, HashSet<PathBuf>>,
    pub is_interactive: bool,
    pub root_dir: PathBuf,
    
    pub max_instructions: usize,
}

impl VMState {
    pub fn new(permissions: Permissions, is_interactive: bool) -> Self {
        let mut whitelists = HashMap::new();
        whitelists.insert("read".to_string(), HashSet::new());
        whitelists.insert("write".to_string(), HashSet::new());
        whitelists.insert("run".to_string(), HashSet::new());

        let root_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

        Self {
            stack: Vec::with_capacity(1024),
            memory: vec![StackValue::Null; 1024],
            globals: vec![StackValue::Null; 512],
            ip: 0,
            bp: 0,
            memory_stack_pointer: 0,
            call_stack: Vec::with_capacity(256),
            logs: Vec::new(),
            bytecode: Vec::new(),
            string_pool: Vec::new(),
            args: Vec::new(),
            instruction_count: 0,
            permissions,
            whitelists,
            is_interactive,
            root_dir,
            max_instructions: 10_000_000,
        }
    }

    pub fn push(&mut self, val: StackValue) {
        if self.stack.len() >= 4096 {
            panic!("Stack Overflow: VM Stack limit reached (4096)");
        }
        self.stack.push(val);
    }

    pub fn pop(&mut self) -> StackValue {
        self.stack.pop().expect("Stack Underflow")
    }

    pub fn peek(&self) -> &StackValue {
        self.stack.last().expect("Stack Underflow (peek)")
    }

    pub fn read_operand(&mut self) -> i64 {
        if self.ip >= self.bytecode.len() {
            return 0; // HALT
        }
        let val = self.bytecode[self.ip];
        self.ip += 1;
        val
    }

    pub fn ensure_memory(&mut self, addr: usize) {
        if addr > 1_000_000 {
            panic!("Memory Limit Exceeded: Address {} exceeds 1MB limit", addr);
        }
        if addr >= self.memory.len() {
            self.memory.resize(addr + 1, StackValue::Null);
        }
    }

    pub fn ensure_globals(&mut self, addr: usize) {
        if addr > 100_000 {
            panic!("Globals Limit Exceeded: Address {} exceeds limit", addr);
        }
        if addr >= self.globals.len() {
            self.globals.resize(addr + 1, StackValue::Null);
        }
    }

    pub fn check_permission(&self, perm_type: &str, target: Option<&str>) {
        let has_perm = match perm_type {
            "read" => self.permissions.read,
            "write" => self.permissions.write,
            "run" => self.permissions.run,
            "network" => self.permissions.network,
            _ => false,
        };

        if !has_perm {
            panic!("Permission Error: Restricted access to '{}' system", perm_type);
        }

        if let Some(target_path) = target {
            if let Some(whitelist) = self.whitelists.get(perm_type) {
                if !whitelist.is_empty() {
                    let resolved = self.safe_resolve(target_path);
                    let mut allowed = false;
                    for path in whitelist {
                        // Ensure both are canonical for comparison if possible
                        if let Ok(canon_path) = std::fs::canonicalize(path) {
                            if resolved.starts_with(canon_path) {
                                allowed = true;
                                break;
                            }
                        } else if resolved.starts_with(path) {
                            allowed = true;
                            break;
                        }
                    }
                    if !allowed {
                        panic!("Security Error: Path '{}' is not whitelisted for '{}'", target_path, perm_type);
                    }
                }
            }
        }
    }

    pub fn safe_resolve(&self, user_path: &str) -> PathBuf {
        let path = PathBuf::from(user_path);
        
        // Always treat input as relative to sandbox root, even if it looks absolute
        let mut full_path = self.root_dir.clone();
        
        for component in path.components() {
            match component {
                std::path::Component::Normal(c) => full_path.push(c),
                std::path::Component::ParentDir => {
                    // Only allow going up if we are still within root_dir
                    let parent = full_path.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| self.root_dir.clone());
                    if parent.starts_with(&self.root_dir) {
                        full_path = parent;
                    }
                }
                _ => {} // Ignore root, current dir, etc.
            }
        }

        match std::fs::canonicalize(&full_path) {
            Ok(p) => {
                if p.starts_with(&self.root_dir) {
                    p
                } else {
                    self.root_dir.clone()
                }
            },
            Err(_) => {
                // If it doesn't exist, we've already manually handled ".." so it should be safe
                full_path
            }
        }
    }
}
