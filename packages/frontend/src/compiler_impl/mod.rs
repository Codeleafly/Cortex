pub mod stmt;
pub mod expr;

use nox_shared::Opcode;
use crate::ast::Stmt;
use std::collections::HashMap;

pub struct Compiler {
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
    pub scopes: Vec<HashMap<String, VariableInfo>>,
    pub functions: HashMap<String, FunctionInfo>,
    pub function_start_scope_index: usize,
}

pub struct VariableInfo {
    pub address: usize,
    pub is_mutable: bool,
}

pub struct FunctionInfo {
    pub address: usize,
    pub arg_count: usize,
}

pub struct CompilationResult {
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
}

impl Compiler {
    pub fn new() -> Self {
        Self {
            bytecode: Vec::new(),
            string_pool: Vec::new(),
            scopes: vec![HashMap::new()],
            functions: HashMap::new(),
            function_start_scope_index: 0,
        }
    }

    pub fn compile(&mut self, statements: Vec<Stmt>) -> CompilationResult {
        for stmt in statements {
            self.statement(stmt);
        }
        self.emit(Opcode::HALT as i64);
        CompilationResult {
            bytecode: self.bytecode.clone(),
            string_pool: self.string_pool.clone(),
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
