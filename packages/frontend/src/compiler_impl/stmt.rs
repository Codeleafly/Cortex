use nox_shared::Opcode;
use crate::ast::Stmt;
use crate::compiler_impl::{Compiler, FunctionInfo};
use std::collections::HashMap;

impl Compiler {
    pub fn statement(&mut self, stmt: Stmt) {
        match stmt {
            Stmt::Let { name, initializer, is_mutable } => {
                self.expression(initializer);
                let addr = self.define_variable(name, is_mutable);
                self.emit(Opcode::STORE as i64);
                self.emit(addr);
            }
            Stmt::Assign { name, value } => {
                let (addr, is_mutable) = self.resolve_variable(&name);
                if !is_mutable {
                    panic!("Immutable Error: Cannot re-assign constant variable '{}'", name);
                }
                self.expression(value);
                self.emit(Opcode::STORE as i64);
                self.emit(addr);
            }
            Stmt::Print { expression } => {
                self.expression(expression);
                self.emit(Opcode::PRINT as i64);
            }
            Stmt::If { condition, then_branch, else_branch } => {
                self.expression(condition);
                self.emit(Opcode::JMP_IF_FALSE as i64);
                let jump_to_else_idx = self.bytecode.len();
                self.emit(0);

                self.scopes.push(HashMap::new());
                for s in then_branch { self.statement(s); }
                self.scopes.pop();

                if let Some(else_stmts) = else_branch {
                    self.emit(Opcode::JMP as i64);
                    let jump_to_end_idx = self.bytecode.len();
                    self.emit(0);
                    
                    self.bytecode[jump_to_else_idx] = self.bytecode.len() as i64;
                    
                    self.scopes.push(HashMap::new());
                    for s in else_stmts { self.statement(s); }
                    self.scopes.pop();
                    
                    self.bytecode[jump_to_end_idx] = self.bytecode.len() as i64;
                } else {
                    self.bytecode[jump_to_else_idx] = self.bytecode.len() as i64;
                }
            }
            Stmt::While { condition, body } => {
                let loop_start = self.bytecode.len() as i64;
                self.expression(condition);
                self.emit(Opcode::JMP_IF_FALSE as i64);
                let jump_to_end_idx = self.bytecode.len();
                self.emit(0);

                self.scopes.push(HashMap::new());
                for s in body { self.statement(s); }
                self.scopes.pop();

                self.emit(Opcode::JMP as i64);
                self.emit(loop_start);
                self.bytecode[jump_to_end_idx] = self.bytecode.len() as i64;
            }
            Stmt::Fn { name, params, body } => {
                self.emit(Opcode::JMP as i64);
                let jump_over_idx = self.bytecode.len();
                self.emit(0);

                let fn_start = self.bytecode.len();
                self.functions.insert(name.clone(), FunctionInfo { address: fn_start, arg_count: params.len() });

                let old_start_scope = self.function_start_scope_index;
                self.function_start_scope_index = self.scopes.len();
                self.scopes.push(HashMap::new());

                for p in params.into_iter().rev() {
                    let addr = self.define_variable(p, true);
                    self.emit(Opcode::STORE as i64);
                    self.emit(addr);
                }

                for s in body { self.statement(s); }

                self.emit(Opcode::PUSH as i64);
                self.emit(0); // null
                self.emit(Opcode::RET as i64);

                self.scopes.pop();
                self.function_start_scope_index = old_start_scope;
                self.bytecode[jump_over_idx] = self.bytecode.len() as i64;
            }
            Stmt::Return { value } => {
                self.expression(value);
                self.emit(Opcode::RET as i64);
            }
            Stmt::Expr(expr) => {
                self.expression(expr);
                self.emit(Opcode::POP as i64);
            }
            _ => panic!("Statement type not recognized in compiler"),
        }
    }
}
