// Nox Runtime Library (Rust)
pub mod vm;

use nox_shared::Opcode;
use vm::{VMState, Permissions, StackValue};

pub struct VM {
    pub state: VMState,
}

impl VM {
    pub fn new(permissions: Permissions, is_interactive: bool) -> Self {
        Self {
            state: VMState::new(permissions, is_interactive),
        }
    }

    pub async fn run(&mut self, bytecode: Vec<i64>, string_pool: Vec<String>, args: Vec<String>) {
        self.state.bytecode = bytecode;
        self.state.string_pool = string_pool;
        self.state.args = args;
        self.state.ip = 0;
        self.state.bp = 0;
        self.state.memory_stack_pointer = 0;
        self.state.logs.clear();
        self.state.stack.clear();
        self.state.call_stack.clear();
        self.state.instruction_count = 0;
        self.state.globals.fill(StackValue::Null);
        
        self.execute().await;
    }

    async fn execute(&mut self) {
        while self.state.ip < self.state.bytecode.len() {
            self.state.instruction_count += 1;
            if self.state.instruction_count > self.state.max_instructions {
                panic!("Resource Exhaustion: Maximum instruction limit reached");
            }

            let op_code_val = self.state.read_operand();
            let opcode = Opcode::from(op_code_val);

            if opcode == Opcode::HALT { break; }
            if opcode == Opcode::SLEEP {
                let ms = self.state.pop();
                if let StackValue::Number(n) = ms {
                    tokio::time::sleep(tokio::time::Duration::from_millis(n as u64)).await;
                } else {
                    panic!("SLEEP requires numeric milliseconds");
                }
                continue;
            }

            if vm::opcodes::execute_math(opcode, &mut self.state) { continue; }
            if vm::opcodes::execute_io(opcode, &mut self.state) { continue; }
            if vm::opcodes::execute_control(opcode, &mut self.state) { continue; }
            if vm::opcodes::execute_memory_and_core(opcode, &mut self.state) { continue; }
            
            todo!("Opcode {:?} not yet implemented", opcode);
        }
    }
}
