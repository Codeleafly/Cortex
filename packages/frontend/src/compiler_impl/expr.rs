use nox_shared::{Opcode, TokenType};
use crate::ast::{Expr, LiteralValue};
use crate::compiler_impl::Compiler;

impl Compiler {
    pub fn expression(&mut self, expr: Expr) {
        match expr {
            Expr::Literal(val) => {
                match val {
                    LiteralValue::Number(n) => {
                        self.emit(Opcode::PUSH as i64);
                        self.emit(n);
                    }
                    LiteralValue::String(s) => {
                        self.emit(Opcode::PUSH_STR as i64);
                        let idx = self.string_pool.len();
                        self.string_pool.push(s);
                        self.emit(idx as i64);
                    }
                    LiteralValue::Boolean(b) => {
                        self.emit(Opcode::PUSH as i64);
                        self.emit(if b { 1 } else { 0 });
                    }
                    LiteralValue::Null => {
                        self.emit(Opcode::PUSH as i64);
                        self.emit(0);
                    }
                }
            }
            Expr::Binary { left, operator, right } => {
                match operator.token_type {
                    TokenType::AND_AND => {
                        self.expression(*left);
                        self.emit(Opcode::DUP as i64);
                        self.emit(Opcode::JMP_IF_FALSE as i64);
                        let jump_idx = self.bytecode.len();
                        self.emit(0);
                        self.emit(Opcode::POP as i64);
                        self.expression(*right);
                        self.bytecode[jump_idx] = self.bytecode.len() as i64;
                    }
                    TokenType::OR_OR => {
                        self.expression(*left);
                        self.emit(Opcode::DUP as i64);
                        self.emit(Opcode::JMP_IF_TRUE as i64);
                        let jump_idx = self.bytecode.len();
                        self.emit(0);
                        self.emit(Opcode::POP as i64);
                        self.expression(*right);
                        self.bytecode[jump_idx] = self.bytecode.len() as i64;
                    }
                    _ => {
                        self.expression(*left);
                        self.expression(*right);
                        match operator.token_type {
                            TokenType::PLUS => self.emit(Opcode::ADD as i64),
                            TokenType::MINUS => self.emit(Opcode::SUB as i64),
                            TokenType::STAR => self.emit(Opcode::MUL as i64),
                            TokenType::SLASH => self.emit(Opcode::DIV as i64),
                            TokenType::GT => self.emit(Opcode::CMP_GT as i64),
                            TokenType::LT => self.emit(Opcode::CMP_LT as i64),
                            TokenType::GT_EQ => self.emit(Opcode::CMP_GE as i64),
                            TokenType::LT_EQ => self.emit(Opcode::CMP_LE as i64),
                            TokenType::EQ_EQ => self.emit(Opcode::CMP_EQ as i64),
                            TokenType::BANG_EQ => self.emit(Opcode::CMP_NEQ as i64),
                            _ => todo!("Operator {:?} not implemented", operator.token_type),
                        }
                    }
                }
            }
            Expr::Unary { operator, right, is_prefix } => {
                self.expression(*right);
                match operator.token_type {
                    TokenType::BANG => {
                        if is_prefix {
                            self.emit(Opcode::NOT as i64);
                        } else {
                            self.emit(Opcode::AWAIT as i64);
                        }
                    }
                    TokenType::MINUS => {
                        self.emit(Opcode::PUSH as i64);
                        self.emit(-1);
                        self.emit(Opcode::MUL as i64);
                    }
                    _ => todo!("Unary operator {:?} not implemented", operator.token_type),
                }
            }
            Expr::Variable(name) => {
                let (addr, _) = self.resolve_variable(&name);
                self.emit(Opcode::LOAD as i64);
                self.emit(addr);
            }
            Expr::Call { callee, args } => {
                for arg in args { self.expression(arg); }
                let (addr, arg_count) = {
                    let fn_info = self.functions.get(&callee).expect("Undefined function");
                    (fn_info.address as i64, fn_info.arg_count as i64)
                };
                self.emit(Opcode::CALL as i64);
                self.emit(addr);
                self.emit(arg_count);
            }
            Expr::Grouping(e) => self.expression(*e),
            Expr::Pipe { left, right } => {
                match *right {
                    Expr::Call { callee, mut args } => {
                        let mut new_args = vec![*left];
                        new_args.append(&mut args);
                        self.expression(Expr::Call { callee, args: new_args });
                    }
                    Expr::Variable(name) => {
                        self.expression(Expr::Call { callee: name, args: vec![*left] });
                    }
                    _ => panic!("Pipe right-hand side must be a call or function name"),
                }
            }
            Expr::SafeCall { left, right } => {
                self.expression(*left);
                self.emit(Opcode::DUP as i64);
                self.emit(Opcode::PUSH as i64);
                self.emit(0); // push null
                self.emit(Opcode::CMP_EQ as i64);
                self.emit(Opcode::JMP_IF_TRUE as i64);
                let jump_to_null_idx = self.bytecode.len();
                self.emit(0);
                
                self.emit(Opcode::PUSH_STR as i64);
                let idx = self.string_pool.len();
                self.string_pool.push(right);
                self.emit(idx as i64);
                self.emit(Opcode::DICT_GET as i64);
                
                self.bytecode[jump_to_null_idx] = self.bytecode.len() as i64;
            }
            Expr::NullCoalesce { left, right } => {
                self.expression(*left);
                self.emit(Opcode::DUP as i64);
                self.emit(Opcode::PUSH as i64);
                self.emit(0); // push null
                self.emit(Opcode::CMP_NEQ as i64);
                self.emit(Opcode::JMP_IF_TRUE as i64);
                let jump_to_result_idx = self.bytecode.len();
                self.emit(0);
                
                self.emit(Opcode::POP as i64); // pop the null
                self.expression(*right);
                
                self.bytecode[jump_to_result_idx] = self.bytecode.len() as i64;
            }
            Expr::Dict(entries) => {
                let count = entries.len() as i64;
                for (key, value) in entries {
                    self.emit(Opcode::PUSH_STR as i64);
                    let idx = self.string_pool.len();
                    self.string_pool.push(key);
                    self.emit(idx as i64);
                    self.expression(value);
                }
                self.emit(Opcode::DICT_BUILD as i64);
                self.emit(count);
            }
            Expr::Range { start, end } => {
                self.expression(*start);
                self.expression(*end);
                self.emit(Opcode::RANGE as i64);
            }
            Expr::ArgCount => {
                self.emit(Opcode::ARG_COUNT as i64);
            }
        }
    }
}
