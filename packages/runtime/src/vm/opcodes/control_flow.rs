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
