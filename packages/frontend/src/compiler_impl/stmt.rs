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
                let var_info = self.resolve_variable(&name);
                match var_info {
                    Some((addr, is_mutable)) => {
                        if !is_mutable {
                            panic!("Immutable Error: Cannot re-assign constant variable '{}'", name);
                        }
                        self.expression(value);
                        self.emit(Opcode::STORE as i64);
                        self.emit(addr);
                    }
                    None => {
                        // Implicit declaration in non-strict mode (handled by parser sometimes, but here as fallback)
                        self.expression(value);
                        let addr = self.define_variable(name, true);
                        self.emit(Opcode::STORE as i64);
                        self.emit(addr);
                    }
                }
            }
            Stmt::Print { expression } => {
                self.expression(expression);
                self.emit(Opcode::PRINT as i64);
            }
            Stmt::If { condition, then_branch, else_branch } => {
                self.expression(condition);
                self.emit(Opcode::JMP_IF_FALSE as i64);
                let jump_to_else_idx = self.bytecode.len();
                self.jump_offsets.push(jump_to_else_idx);
                self.emit(0);

                self.scopes.push(HashMap::new());
                for s in then_branch { self.statement(s); }
                self.scopes.pop();

                if let Some(else_stmts) = else_branch {
                    self.emit(Opcode::JMP as i64);
                    let jump_to_end_idx = self.bytecode.len();
                    self.jump_offsets.push(jump_to_end_idx);
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
                self.jump_offsets.push(jump_to_end_idx);
                self.emit(0);

                self.scopes.push(HashMap::new());
                for s in body { self.statement(s); }
                self.scopes.pop();

                self.emit(Opcode::JMP as i64);
                self.jump_offsets.push(self.bytecode.len());
                self.emit(loop_start);
                self.bytecode[jump_to_end_idx] = self.bytecode.len() as i64;
            }
            Stmt::Fn { name, params, body } => {
                self.emit(Opcode::JMP as i64);
                let jump_over_idx = self.bytecode.len();
                self.jump_offsets.push(jump_over_idx);
                self.emit(0);

                let fn_start = self.bytecode.len();
                self.functions.insert(name.clone(), FunctionInfo { address: fn_start, arg_count: params.len() });
                self.local_functions.insert(name.clone());

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
            Stmt::Import { names, source } => {
                self.imports.push((names, source));
            }
            Stmt::Export(inner) => {
                 match &*inner {
                     Stmt::Let { name, .. } => self.exports.push(name.clone()),
                     Stmt::Fn { name, .. } => self.exports.push(name.clone()),
                     _ => {}
                 }
                 self.statement(*inner.clone());
            }
            Stmt::ExportList(names) => {
                self.exports.extend(names);
            }
            Stmt::Expr(expr) => {
                self.expression(expr);
                self.emit(Opcode::POP as i64);
            }
            Stmt::For { item, iterable, body } => {
                self.expression(iterable);
                let loop_start = self.bytecode.len() as i64;
                self.emit(Opcode::ITER_NEXT as i64);
                let jump_to_end_idx = self.bytecode.len();
                self.jump_offsets.push(jump_to_end_idx);
                self.emit(0);

                self.scopes.push(HashMap::new());
                let addr = self.define_variable(item, true);
                self.emit(Opcode::STORE as i64);
                self.emit(addr);

                for s in body { self.statement(s); }
                self.scopes.pop();

                self.emit(Opcode::JMP as i64);
                self.jump_offsets.push(self.bytecode.len());
                self.emit(loop_start);

                let end_addr = self.bytecode.len() as i64;
                self.bytecode[jump_to_end_idx] = end_addr;
            }
            Stmt::Match { expression, cases } => {
                self.expression(expression);
                let mut end_jumps = Vec::new();
                let mut has_default = false;

                for (condition, body) in cases {
                    if let Some(cond_expr) = condition {
                        self.emit(Opcode::DUP as i64);
                        self.expression(cond_expr);
                        self.emit(Opcode::CMP_EQ as i64);
                        self.emit(Opcode::JMP_IF_TRUE as i64);
                        let matched_idx = self.bytecode.len();
                        self.jump_offsets.push(matched_idx);
                        self.emit(0);

                        // If not matched, we need to jump to the next case
                        self.emit(Opcode::JMP as i64);
                        let next_case_idx = self.bytecode.len();
                        self.jump_offsets.push(next_case_idx);
                        self.emit(0);

                        // Matched!
                        let matched_addr = self.bytecode.len() as i64;
                        self.bytecode[matched_idx] = matched_addr;

                        self.emit(Opcode::POP as i64); // Pop the original match value

                        self.scopes.push(HashMap::new());
                        for s in body { self.statement(s); }
                        self.scopes.pop();

                        self.emit(Opcode::JMP as i64);
                        end_jumps.push(self.bytecode.len());
                        self.jump_offsets.push(self.bytecode.len());
                        self.jump_offsets.push(self.bytecode.len());
                        self.emit(0);

                        let next_case_addr = self.bytecode.len() as i64;
                        self.bytecode[next_case_idx] = next_case_addr;
                    } else {
                        self.emit(Opcode::POP as i64); // Pop the original match value
                        self.scopes.push(HashMap::new());
                        for s in body { self.statement(s); }
                        self.scopes.pop();

                        self.emit(Opcode::JMP as i64);
                        end_jumps.push(self.bytecode.len());
                        self.emit(0);

                        has_default = true;
                        break; // Default case should be the last one processed
                    }
                }

                if !has_default {
                    self.emit(Opcode::POP as i64); // Pop the original match value if no cases matched
                }

                let end_addr = self.bytecode.len() as i64;
                for jump_idx in end_jumps {
                    self.bytecode[jump_idx] = end_addr;
                }
            }
        }
    }
}
