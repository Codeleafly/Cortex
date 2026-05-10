use nox_shared::Opcode;
use crate::vm::{VMState, StackValue};

pub fn execute_math(opcode: Opcode, state: &mut VMState) -> bool {
    match opcode {
        Opcode::ADD => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => {
                    let res = a.checked_add(b).expect("Arithmetic Overflow: ADD");
                    state.push(StackValue::Number(res));
                }
                (StackValue::String(a), StackValue::String(b)) => state.push(StackValue::String(format!("{}{}", a, b))),
                (StackValue::String(_), StackValue::Number(_)) | (StackValue::Number(_), StackValue::String(_)) => {
                    panic!("TypeError: Cannot directly add String and Number. Use explicit conversion (e.g., to_string() or to_number()).");
                }
                _ => panic!("TypeError: Invalid types for ADD operator."),
            }
            true
        }
        Opcode::SUB => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => {
                    let res = a.checked_sub(b).expect("Arithmetic Overflow: SUB");
                    state.push(StackValue::Number(res));
                }
                _ => panic!("SUB requires numeric operands"),
            }
            true
        }
        Opcode::MUL => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => {
                    let res = a.checked_mul(b).expect("Arithmetic Overflow: MUL");
                    state.push(StackValue::Number(res));
                }
                _ => panic!("MUL requires numeric operands"),
            }
            true
        }
        Opcode::DIV => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => {
                    if b == 0 { panic!("Division by zero"); }
                    let res = a.checked_div(b).expect("Arithmetic Overflow: DIV");
                    state.push(StackValue::Number(res));
                },
                _ => panic!("DIV requires numeric operands"),
            }
            true
        }
        Opcode::CMP_GT => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => state.push(StackValue::Boolean(a > b)),
                _ => panic!("CMP_GT requires numeric operands"),
            }
            true
        }
        Opcode::CMP_LT => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => state.push(StackValue::Boolean(a < b)),
                _ => panic!("CMP_LT requires numeric operands"),
            }
            true
        }
        Opcode::CMP_GE => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => state.push(StackValue::Boolean(a >= b)),
                _ => panic!("CMP_GE requires numeric operands"),
            }
            true
        }
        Opcode::CMP_LE => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Number(a), StackValue::Number(b)) => state.push(StackValue::Boolean(a <= b)),
                _ => panic!("CMP_LE requires numeric operands"),
            }
            true
        }
        Opcode::CMP_EQ => {
            let b = state.pop();
            let a = state.pop();
            state.push(StackValue::Boolean(a == b));
            true
        }
        Opcode::CMP_NEQ => {
            let b = state.pop();
            let a = state.pop();
            state.push(StackValue::Boolean(a != b));
            true
        }
        Opcode::AND => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Boolean(a), StackValue::Boolean(b)) => state.push(StackValue::Boolean(a && b)),
                _ => panic!("AND requires boolean operands"),
            }
            true
        }
        Opcode::OR => {
            let b = state.pop();
            let a = state.pop();
            match (a, b) {
                (StackValue::Boolean(a), StackValue::Boolean(b)) => state.push(StackValue::Boolean(a || b)),
                _ => panic!("OR requires boolean operands"),
            }
            true
        }
        Opcode::NOT => {
            let a = state.pop();
            match a {
                StackValue::Boolean(val) => state.push(StackValue::Boolean(!val)),
                StackValue::Number(n) => state.push(StackValue::Boolean(n == 0)),
                StackValue::Null => state.push(StackValue::Boolean(true)),
                _ => state.push(StackValue::Boolean(false)),
            }
            true
        }
        _ => false, // Handled elsewhere
    }
}
