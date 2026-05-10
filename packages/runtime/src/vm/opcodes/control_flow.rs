use nox_shared::Opcode;
use crate::vm::{VMState, StackValue, CallFrame};

pub fn execute_control(opcode: Opcode, state: &mut VMState) -> bool {
    match opcode {
        Opcode::JMP => {
            let target = state.read_operand() as usize;
            state.ip = target;
            true
        }
        Opcode::JMP_IF_FALSE => {
            let target = state.read_operand() as usize;
            let cond = state.pop();
            if let StackValue::Boolean(false) = cond {
                state.ip = target;
            } else if let StackValue::Number(0) = cond {
                state.ip = target;
            } else if let StackValue::Null = cond {
                state.ip = target;
            }
            true
        }
        Opcode::JMP_IF_TRUE => {
            let target = state.read_operand() as usize;
            let cond = state.pop();
            if let StackValue::Boolean(true) = cond {
                state.ip = target;
            } else if let StackValue::Number(n) = cond {
                if n != 0 { state.ip = target; }
            }
            true
        }
        Opcode::CALL => {
            let mut address = state.read_operand();
            let arg_count = state.read_operand() as usize;
            
            if address == -1 {
                let val = state.pop();
                if let StackValue::Number(n) = val {
                    address = n;
                } else {
                    panic!("CALL requires numeric address on stack for dynamic calls");
                }
            }

            if state.stack.len() < arg_count {
                panic!("Stack Underflow: CALL requires {} arguments but only {} on stack", arg_count, state.stack.len());
            }

            // Handle built-in methods
            match address {
                -100 => { // Array.push
                    let arr_val = state.pop();
                    let item = state.pop();
                    if let StackValue::Array(mut arr) = arr_val {
                        arr.push(item);
                        state.push(StackValue::Array(arr));
                        return true;
                    }
                    panic!("Array.push called on non-array");
                }
                -101 => { // Array.get
                    let arr_val = state.pop();
                    let idx = state.pop();
                    if let (StackValue::Array(arr), StackValue::Number(i)) = (arr_val, idx) {
                        if i >= 0 && (i as usize) < arr.len() {
                            state.push(arr[i as usize].clone());
                        } else {
                            state.push(StackValue::Null);
                        }
                        return true;
                    }
                    panic!("Array.get called with invalid arguments");
                }
                -102 => { // Array.len
                    let arr_val = state.pop();
                    if let StackValue::Array(arr) = arr_val {
                        state.push(StackValue::Number(arr.len() as i64));
                        return true;
                    }
                    panic!("Array.len called on non-array");
                }
                _ => {}
            }

            let old_sp = state.stack.len() - arg_count;
            state.call_stack.push(CallFrame {
                return_addr: state.ip,
                old_bp: state.bp,
                old_sp,
            });
            state.bp = state.memory_stack_pointer;
            state.ip = address as usize;
            true
        }
        Opcode::RET => {
            let frame = state.call_stack.pop().expect("Top-level return");
            let return_value = if state.stack.len() > frame.old_sp {
                state.pop()
            } else {
                StackValue::Null
            };
            
            state.memory_stack_pointer = state.bp;
            state.bp = frame.old_bp;
            state.ip = frame.return_addr;
            
            state.stack.truncate(frame.old_sp);
            state.push(return_value);
            true
        }
        _ => false,
    }
}
