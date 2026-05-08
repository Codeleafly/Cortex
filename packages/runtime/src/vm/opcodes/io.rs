use nox_shared::Opcode;
use crate::vm::{VMState, StackValue};
use std::process::Command;

pub fn execute_io(opcode: Opcode, state: &mut VMState) -> bool {
    match opcode {
        Opcode::PRINT => {
            let val = state.pop();
            let msg = match val {
                StackValue::Number(n) => n.to_string(),
                StackValue::String(s) => s,
                StackValue::Boolean(b) => if b { "1".to_string() } else { "0".to_string() },
                StackValue::Null => "null".to_string(),
                _ => "object".to_string(),
            };
            state.logs.push(msg.clone());
            println!("{}", msg);
            true
        }
        Opcode::READ_LINE => {
            if !state.is_interactive {
                panic!("READ_LINE denied in non-interactive mode");
            }
            let mut input = String::new();
            std::io::stdin().read_line(&mut input).expect("Failed to read line");
            state.push(StackValue::String(input.trim().to_string()));
            true
        }
        Opcode::READ_FILE => {
            let user_path = state.pop();
            if let StackValue::String(path_str) = user_path {
                state.check_permission("read", Some(&path_str));
                let safe_path = state.safe_resolve(&path_str);
                match std::fs::read_to_string(safe_path) {
                    Ok(content) => state.push(StackValue::String(content)),
                    Err(_) => state.push(StackValue::Null),
                }
            } else {
                panic!("READ_FILE requires string path");
            }
            true
        }
        Opcode::WRITE_FILE => {
            let content = state.pop();
            let user_path = state.pop();
            if let (StackValue::String(path_str), StackValue::String(cont)) = (user_path, content) {
                state.check_permission("write", Some(&path_str));
                let safe_path = state.safe_resolve(&path_str);
                match std::fs::write(safe_path, cont) {
                    Ok(_) => state.push(StackValue::Number(1)),
                    Err(_) => state.push(StackValue::Number(0)),
                }
            } else {
                panic!("WRITE_FILE requires string path and content");
            }
            true
        }
        Opcode::FILE_EXISTS => {
            let user_path = state.pop();
            if let StackValue::String(path_str) = user_path {
                state.check_permission("read", Some(&path_str));
                let safe_path = state.safe_resolve(&path_str);
                state.push(StackValue::Boolean(safe_path.exists()));
            } else {
                panic!("FILE_EXISTS requires string path");
            }
            true
        }
        Opcode::RUN_CMD => {
            let cmd = state.pop();
            if let StackValue::String(cmd_str) = cmd {
                state.check_permission("run", Some(&cmd_str));
                let output = Command::new("sh")
                    .arg("-c")
                    .arg(cmd_str)
                    .output();
                match output {
                    Ok(out) => state.push(StackValue::String(String::from_utf8_lossy(&out.stdout).to_string())),
                    Err(_) => state.push(StackValue::Null),
                }
            } else {
                panic!("RUN_CMD requires string");
            }
            true
        }
        _ => false,
    }
}
