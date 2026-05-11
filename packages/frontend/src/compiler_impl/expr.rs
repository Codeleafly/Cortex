use crate::ast::{Expr, LiteralValue};
use crate::compiler_impl::Compiler;
use nox_shared::{Opcode, TokenType};
use std::collections::HashMap;

impl Compiler {
    pub fn expression(&mut self, expr: Expr) {
        match expr {
            Expr::Literal(val) => match val {
                LiteralValue::Number(n) => {
                    self.emit(Opcode::PUSH as i64);
                    self.emit(n);
                }
                LiteralValue::String(s) => {
                    self.emit(Opcode::PUSH_STR as i64);
                    let idx = self.string_pool.len();
                    self.string_pool.push(s);
                    self.string_offsets.push(self.bytecode.len());
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
            },
            Expr::Binary {
                left,
                operator,
                right,
            } => match operator.token_type {
                TokenType::AND_AND => {
                    self.expression(*left);
                    self.emit(Opcode::DUP as i64);
                    self.emit(Opcode::JMP_IF_FALSE as i64);
                    let jump_idx = self.bytecode.len();
                    self.jump_offsets.push(jump_idx);
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
                    self.jump_offsets.push(jump_idx);
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
            },
            Expr::Unary {
                operator,
                right,
                is_prefix,
            } => {
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
                let var_info = self.resolve_variable(&name);
                match var_info {
                    Some((addr, _)) => {
                        self.emit(Opcode::LOAD as i64);
                        self.emit(addr);
                    }
                    None => panic!("Undefined variable: {}", name),
                }
            }
            Expr::Call { callee, args } => {
                match callee.as_str() {
                    "http_get" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::HTTP_GET as i64);
                        return;
                    }
                    "json_parse" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::JSON_PARSE as i64);
                        return;
                    }
                    "json_str" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::JSON_STR as i64);
                        return;
                    }
                    "os_info" => {
                        self.emit(Opcode::OS_INFO as i64);
                        return;
                    }
                    "print" | "say" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::PRINT as i64);
                        self.emit(Opcode::PUSH as i64);
                        self.emit(0);
                        return;
                    }
                    "ask" | "input" | "read_line" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::READ_LINE as i64);
                        return;
                    }
                    "arg_count" => {
                        self.emit(Opcode::ARG_COUNT as i64);
                        return;
                    }
                    "get_arg" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::GET_ARG as i64);
                        return;
                    }
                    "to_number" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::TO_NUMBER as i64);
                        return;
                    }
                    "read_file" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::READ_FILE as i64);
                        return;
                    }
                    "write_file" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::WRITE_FILE as i64);
                        return;
                    }
                    "file_exists" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::FILE_EXISTS as i64);
                        return;
                    }
                    "str_upper" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::STR_UPPER as i64);
                        return;
                    }
                    "str_words" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::STR_WORDS as i64);
                        return;
                    }
                    "str_at" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::STR_AT as i64);
                        return;
                    }
                    "str_len" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::STR_LEN as i64);
                        return;
                    }
                    "run_command" => {
                        for arg in args {
                            self.expression(arg);
                        }
                        self.emit(Opcode::RUN_CMD as i64);
                        return;
                    }
                    _ => {}
                }
                let arg_len = args.len();
                for arg in args {
                    self.expression(arg);
                }
                let fn_info = self.functions.get(&callee).cloned();
                match fn_info {
                    Some(info) => {
                        let addr = info.address as i64;
                        let arg_count = info.arg_count as i64;
                        self.emit(Opcode::CALL as i64);
                        self.function_calls
                            .push((self.bytecode.len(), callee.clone()));
                        self.emit(addr);
                        self.emit(arg_count);
                    }
                    None => {
                        let var_info = self.resolve_variable(&callee);
                        if let Some((addr, _)) = var_info {
                            self.emit(Opcode::LOAD as i64);
                            self.emit(addr);
                            self.emit(Opcode::CALL as i64);
                            self.emit(-1);
                            self.emit(arg_len as i64);
                        } else {
                            panic!("Undefined function or variable: {}", callee);
                        }
                    }
                }
            }
            Expr::Grouping(e) => self.expression(*e),
            Expr::Pipe { left, right } => match *right {
                Expr::Call { callee, mut args } => {
                    let mut new_args = vec![*left];
                    new_args.append(&mut args);
                    self.expression(Expr::Call {
                        callee,
                        args: new_args,
                    });
                }
                Expr::Variable(name) => {
                    self.expression(Expr::Call {
                        callee: name,
                        args: vec![*left],
                    });
                }
                _ => panic!("Pipe right-hand side must be a call or function name"),
            },
            Expr::SafeCall { left, right } => {
                self.expression(*left);
                self.emit(Opcode::DUP as i64);
                self.emit(Opcode::PUSH as i64);
                self.emit(0); // push null
                self.emit(Opcode::CMP_EQ as i64);
                self.emit(Opcode::JMP_IF_TRUE as i64);
                let jump_to_null_idx = self.bytecode.len();
                self.jump_offsets.push(jump_to_null_idx);
                self.emit(0);

                self.emit(Opcode::PUSH_STR as i64);
                let idx = self.string_pool.len();
                self.string_pool.push(right);
                self.string_offsets.push(self.bytecode.len());
                self.emit(idx as i64);
                self.emit(Opcode::DICT_GET as i64);

                self.bytecode[jump_to_null_idx] = self.bytecode.len() as i64;
            }
            Expr::MethodCall {
                receiver,
                method,
                args,
            } => {
                self.compile_method_call(*receiver, method, args);
            }
            Expr::NullCoalesce { left, right } => {
                self.expression(*left);
                self.emit(Opcode::DUP as i64);
                self.emit(Opcode::PUSH as i64);
                self.emit(0); // push null
                self.emit(Opcode::CMP_NEQ as i64);
                self.emit(Opcode::JMP_IF_TRUE as i64);
                let jump_to_result_idx = self.bytecode.len();
                self.jump_offsets.push(jump_to_result_idx);
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
                    self.string_offsets.push(self.bytecode.len());
                    self.emit(idx as i64);
                    self.expression(value);
                }
                self.emit(Opcode::DICT_BUILD as i64);
                self.emit(count);
            }
            Expr::Array(elements) => {
                let count = elements.len() as i64;
                for element in elements {
                    self.expression(element);
                }
                self.emit(Opcode::ARRAY_BUILD as i64);
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
            Expr::Say(e) => {
                self.expression(*e);
                self.emit(Opcode::PRINT as i64);
                self.emit(Opcode::PUSH as i64);
                self.emit(0);
            }
            Expr::Ask(e) => {
                self.expression(*e);
                self.emit(Opcode::READ_LINE as i64);
            }
            Expr::AnonymousFn { params, body } => {
                self.emit(Opcode::JMP as i64);
                let jump_over_idx = self.bytecode.len();
                self.jump_offsets.push(jump_over_idx);
                self.emit(0);

                let fn_start = self.bytecode.len();
                // Since it's anonymous, we don't insert into self.functions,
                // but we need to push its address to the stack.

                let old_start_scope = self.function_start_scope_index;
                self.function_start_scope_index = self.scopes.len();
                self.scopes.push(HashMap::new());

                for p in params.into_iter().rev() {
                    let addr = self.define_variable(p, true);
                    self.emit(Opcode::STORE as i64);
                    self.emit(addr);
                }

                for s in body {
                    self.statement(s);
                }

                self.emit(Opcode::PUSH as i64);
                self.emit(0); // null
                self.emit(Opcode::RET as i64);

                self.scopes.pop();
                self.function_start_scope_index = old_start_scope;
                self.bytecode[jump_over_idx] = self.bytecode.len() as i64;

                self.emit(Opcode::PUSH as i64);
                self.emit(fn_start as i64);
            }
        }
    }
}

impl Compiler {
    pub fn compile_method_call(&mut self, receiver: Expr, method: String, args: Vec<Expr>) {
        let arg_len = args.len();

        match method.as_str() {
            "push" => {
                if arg_len != 1 {
                    panic!("Array.push expects exactly 1 argument");
                }
                self.expression(receiver);
                for arg in args {
                    self.expression(arg);
                }
                self.emit(Opcode::ARRAY_PUSH as i64);
            }
            "get" => {
                if arg_len != 1 {
                    panic!("Array.get expects exactly 1 argument");
                }
                self.expression(receiver);
                for arg in args {
                    self.expression(arg);
                }
                self.emit(Opcode::ARRAY_GET as i64);
            }
            "len" => {
                if arg_len != 0 {
                    panic!("Array.len expects no arguments");
                }
                self.expression(receiver);
                self.emit(Opcode::ARRAY_LEN as i64);
            }
            _ => {
                for arg in args {
                    self.expression(arg);
                }
                self.expression(receiver);
                self.emit(Opcode::PUSH_STR as i64);
                let idx = self.string_pool.len();
                self.string_pool.push(method);
                self.string_offsets.push(self.bytecode.len());
                self.emit(idx as i64);
                self.emit(Opcode::DICT_GET as i64);

                self.emit(Opcode::CALL as i64);
                self.emit(-1); // Dynamic call
                self.emit(arg_len as i64);
            }
        }
    }

    pub fn compile_mutating_method_statement(&mut self, expr: &Expr) -> bool {
        let Expr::MethodCall {
            receiver,
            method,
            args,
        } = expr
        else {
            return false;
        };

        if method != "push" {
            return false;
        }

        let Expr::Variable(name) = receiver.as_ref() else {
            return false;
        };

        let Some((addr, is_mutable)) = self.resolve_variable(name) else {
            panic!("Undefined variable: {}", name);
        };

        if !is_mutable {
            panic!("Cannot mutate immutable variable: {}", name);
        }

        self.expression(Expr::MethodCall {
            receiver: Box::new(Expr::Variable(name.clone())),
            method: method.clone(),
            args: args.clone(),
        });
        self.emit(Opcode::DUP as i64);
        self.emit(Opcode::STORE as i64);
        self.emit(addr);
        self.emit(Opcode::POP as i64);
        true
    }
}
