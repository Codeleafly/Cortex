pub mod stmt;
pub mod expr;

use nox_shared::Opcode;
use crate::ast::Stmt;
use std::collections::{HashMap, HashSet};

#[derive(Clone)]
pub struct Compiler {
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
    pub imports: Vec<(Vec<String>, String)>,
    pub exports: Vec<String>,
    pub jump_offsets: Vec<usize>,
    pub string_offsets: Vec<usize>,
    pub function_calls: Vec<(usize, String)>,
    pub scopes: Vec<HashMap<String, VariableInfo>>,
    pub functions: HashMap<String, FunctionInfo>,
    pub local_functions: HashSet<String>,
    pub function_start_scope_index: usize,
}

#[derive(Clone)]
pub struct VariableInfo {
    pub address: usize,
    pub is_mutable: bool,
}

#[derive(Debug, Clone)]
pub struct FunctionInfo {
    pub address: usize,
    pub arg_count: usize,
}

pub struct CompilationResult {
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
    pub imports: Vec<(Vec<String>, String)>,
    pub exports: Vec<String>,
    pub jump_offsets: Vec<usize>,
    pub string_offsets: Vec<usize>,
    pub function_calls: Vec<(usize, String)>,
    pub functions: HashMap<String, FunctionInfo>,
}

impl Compiler {
    pub fn new() -> Self {
        Self {
            bytecode: Vec::new(),
            string_pool: Vec::new(),
            imports: Vec::new(),
            exports: Vec::new(),
            jump_offsets: Vec::new(),
            string_offsets: Vec::new(),
            function_calls: Vec::new(),
            scopes: vec![HashMap::new()],
            functions: HashMap::new(),
            local_functions: HashSet::new(),
            function_start_scope_index: 0,
        }
    }

    pub fn compile(&mut self, statements: Vec<Stmt>) -> CompilationResult {
        self.compile_no_halt(statements);
        self.emit(Opcode::HALT as i64);
        self.finish()
    }

    pub fn finish(&self) -> CompilationResult {
        let mut local_fns = HashMap::new();
        for name in &self.local_functions {
            if let Some(info) = self.functions.get(name) {
                local_fns.insert(name.clone(), info.clone());
            }
        }
        CompilationResult {
            bytecode: self.bytecode.clone(),
            string_pool: self.string_pool.clone(),
            imports: self.imports.clone(),
            exports: self.exports.clone(),
            jump_offsets: self.jump_offsets.clone(),
            string_offsets: self.string_offsets.clone(),
            function_calls: self.function_calls.clone(),
            functions: local_fns,
        }
    }

    pub fn compile_no_halt(&mut self, statements: Vec<Stmt>) {
        for stmt in statements {
            self.statement(stmt);
        }
    }

    pub fn emit(&mut self, val: i64) {
        self.bytecode.push(val);
    }

    pub fn resolve_variable(&self, name: &str) -> Option<(i64, bool)> {
        for i in (0..self.scopes.len()).rev() {
            if let Some(info) = self.scopes[i].get(name) {
                if self.function_start_scope_index == 0 || i == 0 {
                    return Some((!(info.address as i64), info.is_mutable));
                }
                if i < self.function_start_scope_index {
                    panic!("Closure Error: Cannot access non-global variable from nested function");
                }
                return Some((info.address as i64, info.is_mutable));
            }
        }
        None
    }

    pub fn define_variable(&mut self, name: String, is_mutable: bool) -> i64 {
        let mut offset = 0;
        for i in self.function_start_scope_index..self.scopes.len() {
            offset += self.scopes[i].len();
        }
        
        let current_scope = self.scopes.last_mut().unwrap();
        current_scope.insert(name, VariableInfo { address: offset, is_mutable });
        
        if self.function_start_scope_index == 0 {
            !(offset as i64)
        } else {
            offset as i64
        }
    }
}
