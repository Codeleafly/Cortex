use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

#[derive(Debug, Clone, PartialEq)]
pub enum StackValue {
    Number(i64),
    String(String),
    Boolean(bool),
    Null,
    Dictionary(HashMap<String, StackValue>),
    Range(i64, i64, i64), // start, end, current
}

impl Eq for StackValue {}

#[derive(Debug, Default)]
pub struct Permissions {
    pub read: bool,
    pub write: bool,
    pub run: bool,
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
    
    pub max_instructions: usize,
}

impl VMState {
    pub fn new(permissions: Permissions, is_interactive: bool) -> Self {
        let mut whitelists = HashMap::new();
        whitelists.insert("read".to_string(), HashSet::new());
        whitelists.insert("write".to_string(), HashSet::new());
        whitelists.insert("run".to_string(), HashSet::new());

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
            max_instructions: 1_000_000,
        }
    }

    pub fn push(&mut self, val: StackValue) {
        if self.stack.len() >= 1024 {
            panic!("Stack Overflow");
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
        let val = self.bytecode[self.ip];
        self.ip += 1;
        val
    }

    pub fn ensure_memory(&mut self, addr: usize) {
        if addr >= self.memory.len() {
            self.memory.resize(addr + 1, StackValue::Null);
        }
    }

    pub fn ensure_globals(&mut self, addr: usize) {
        if addr >= self.globals.len() {
            self.globals.resize(addr + 1, StackValue::Null);
        }
    }

    pub fn check_permission(&self, perm_type: &str, target: Option<&str>) {
        let has_perm = match perm_type {
            "read" => self.permissions.read,
            "write" => self.permissions.write,
            "run" => self.permissions.run,
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
                        if resolved.starts_with(path) {
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
        if path.is_absolute() {
            return path;
        }

        let mut full_path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        full_path.push(path);

        match std::fs::canonicalize(&full_path) {
            Ok(p) => p,
            Err(_) => full_path
        }
    }
}
