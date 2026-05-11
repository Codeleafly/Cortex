use crate::vm::{StackValue, VMState};
use nox_shared::Opcode;
use std::collections::HashMap;

pub fn execute_memory_and_core(opcode: Opcode, state: &mut VMState) -> bool {
    match opcode {
        Opcode::PUSH => {
            let val = state.read_operand();
            state.push(StackValue::Number(val));
            true
        }
        Opcode::PUSH_STR => {
            let idx = state.read_operand() as usize;
            if idx < state.string_pool.len() {
                let val = state.string_pool[idx].clone();
                state.push(StackValue::String(val));
            } else {
                panic!(
                    "Bytecode Error: String pool index {} out of bounds (len: {})",
                    idx,
                    state.string_pool.len()
                );
            }
            true
        }
        Opcode::POP => {
            state.pop();
            true
        }
        Opcode::DUP => {
            let val = state.peek().clone();
            state.push(val);
            true
        }
        Opcode::LOAD => {
            let addr = state.read_operand();
            if addr < 0 {
                let final_addr = (!addr) as usize;
                state.ensure_globals(final_addr);
                state.push(state.globals[final_addr].clone());
            } else {
                let final_addr = state.bp + (addr as usize);
                state.ensure_memory(final_addr);
                state.push(state.memory[final_addr].clone());
            }
            true
        }
        Opcode::STORE => {
            let addr = state.read_operand();
            let val = state.pop();
            if addr < 0 {
                let final_addr = (!addr) as usize;
                state.ensure_globals(final_addr);
                state.globals[final_addr] = val;
            } else {
                let final_addr = state.bp + (addr as usize);
                state.ensure_memory(final_addr);
                state.memory[final_addr] = val;
                if final_addr >= state.memory_stack_pointer {
                    state.memory_stack_pointer = final_addr + 1;
                }
            }
            true
        }
        Opcode::ARG_COUNT => {
            state.push(StackValue::Number(state.args.len() as i64));
            true
        }
        Opcode::GET_ARG => {
            let idx = state.pop();
            if let StackValue::Number(n) = idx {
                if n >= 0 && (n as usize) < state.args.len() {
                    state.push(StackValue::String(state.args[n as usize].clone()));
                } else {
                    state.push(StackValue::Null);
                }
            } else {
                panic!("GET_ARG requires numeric index");
            }
            true
        }
        Opcode::TO_NUMBER => {
            let val = state.pop();
            match val {
                StackValue::Number(n) => state.push(StackValue::Number(n)),
                StackValue::String(s) => {
                    let n = s.parse::<i64>().unwrap_or(0);
                    state.push(StackValue::Number(n));
                }
                StackValue::Boolean(b) => state.push(StackValue::Number(if b { 1 } else { 0 })),
                _ => state.push(StackValue::Null),
            }
            true
        }
        Opcode::STR_UPPER => {
            let val = state.pop();
            if let StackValue::String(s) = val {
                state.push(StackValue::String(s.to_uppercase()));
            } else {
                panic!("STR_UPPER requires string");
            }
            true
        }
        Opcode::STR_WORDS => {
            let val = state.pop();
            if let StackValue::String(s) = val {
                let count = s.split_whitespace().count();
                state.push(StackValue::Number(count as i64));
            } else {
                panic!("STR_WORDS requires string");
            }
            true
        }
        Opcode::STR_AT => {
            let idx = state.pop();
            let val = state.pop();
            if let (StackValue::String(s), StackValue::Number(i)) = (val, idx) {
                if i >= 0 {
                    if let Some(c) = s.chars().nth(i as usize) {
                        state.push(StackValue::String(c.to_string()));
                    } else {
                        state.push(StackValue::Null);
                    }
                } else {
                    state.push(StackValue::Null);
                }
            } else {
                panic!("STR_AT requires string and index");
            }
            true
        }
        Opcode::STR_LEN => {
            let val = state.pop();
            if let StackValue::String(s) = val {
                state.push(StackValue::Number(s.chars().count() as i64));
            } else {
                panic!("STR_LEN requires string");
            }
            true
        }
        Opcode::DICT_BUILD => {
            let count = state.read_operand() as usize;
            let mut dict = HashMap::new();
            for _ in 0..count {
                let val = state.pop();
                let key = state.pop();
                if let StackValue::String(k) = key {
                    dict.insert(k, val);
                } else {
                    panic!("Dictionary key must be a string");
                }
            }
            state.push(StackValue::Dictionary(dict));
            true
        }
        Opcode::DICT_GET => {
            let key = state.pop();
            let dict = state.pop();
            match (dict, key) {
                (StackValue::Dictionary(d), StackValue::String(k)) => {
                    state.push(d.get(&k).cloned().unwrap_or(StackValue::Null));
                }
                (StackValue::Array(_), StackValue::String(k)) => match k.as_str() {
                    "push" => state.push(StackValue::Number(-100)),
                    "get" => state.push(StackValue::Number(-101)),
                    "len" => state.push(StackValue::Number(-102)),
                    _ => state.push(StackValue::Null),
                },
                _ => state.push(StackValue::Null),
            }
            true
        }
        Opcode::DICT_SET => {
            let val = state.pop();
            let key = state.pop();
            let mut dict = state.pop();
            if let (StackValue::Dictionary(ref mut d), StackValue::String(k)) = (&mut dict, key) {
                d.insert(k, val);
                state.push(dict);
            } else {
                panic!("DICT_SET requires dictionary and string key");
            }
            true
        }
        Opcode::ARRAY_BUILD => {
            let count = state.read_operand() as usize;
            let mut arr = Vec::with_capacity(count);
            for _ in 0..count {
                arr.push(state.pop());
            }
            arr.reverse(); // Pop in reverse order to maintain correct sequence
            state.push(StackValue::Array(arr));
            true
        }
        Opcode::ARRAY_PUSH => {
            let item = state.pop();
            let arr_val = state.pop();
            if let StackValue::Array(mut arr) = arr_val {
                arr.push(item);
                state.push(StackValue::Array(arr));
            } else {
                panic!("Array.push called on non-array");
            }
            true
        }
        Opcode::ARRAY_GET => {
            let idx = state.pop();
            let arr_val = state.pop();
            if let (StackValue::Array(arr), StackValue::Number(i)) = (arr_val, idx) {
                if i >= 0 && (i as usize) < arr.len() {
                    state.push(arr[i as usize].clone());
                } else {
                    state.push(StackValue::Null);
                }
            } else {
                panic!("Array.get called with invalid arguments");
            }
            true
        }
        Opcode::ARRAY_LEN => {
            let arr_val = state.pop();
            if let StackValue::Array(arr) = arr_val {
                state.push(StackValue::Number(arr.len() as i64));
            } else {
                panic!("Array.len called on non-array");
            }
            true
        }
        Opcode::RANGE => {
            let end = state.pop();
            let start = state.pop();
            if let (StackValue::Number(s), StackValue::Number(e)) = (start, end) {
                state.push(StackValue::Range(s, e, s));
            } else {
                panic!("Range requires numeric bounds");
            }
            true
        }
        Opcode::ITER_NEXT => {
            let target = state.read_operand() as usize;
            let mut iter = state.pop();
            if let StackValue::Range(_s, e, ref mut curr) = iter {
                if *curr <= e {
                    let val = *curr;
                    *curr += 1;
                    state.push(iter); // Push the updated iterator back
                    state.push(StackValue::Number(val));
                } else {
                    state.ip = target;
                    // Note: We don't push the iterator back here, so it's effectively popped
                }
            } else {
                panic!("ITER_NEXT requires range iterator");
            }
            true
        }
        _ => false,
    }
}
