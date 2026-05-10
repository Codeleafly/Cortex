use crate::CompilationResult;
use std::collections::HashMap;
use crate::compiler_impl::FunctionInfo;

pub struct Linker {
    pub bytecode: Vec<i64>,
    pub string_pool: Vec<String>,
    pub functions: HashMap<String, FunctionInfo>,
}

impl Linker {
    pub fn new() -> Self {
        Self {
            bytecode: Vec::new(),
            string_pool: Vec::new(),
            functions: HashMap::new(),
        }
    }

    pub fn link(&mut self, results: Vec<CompilationResult>) {
        let mut call_sites = Vec::new();
        let mut bytecode_offsets = Vec::new();
        let mut string_offsets = Vec::new();

        let has_dependencies = results.len() > 1;
        let initial_offset = if has_dependencies { 2 } else { 0 };

        let mut current_bytecode_offset = initial_offset;
        let mut current_string_offset = 0;

        // First pass: Calculate all offsets
        for res in &results {
            bytecode_offsets.push(current_bytecode_offset);
            string_offsets.push(current_string_offset);
            current_bytecode_offset += res.bytecode.len();
            current_string_offset += res.string_pool.len();
        }

        if has_dependencies {
            let main_offset = *bytecode_offsets.last().unwrap();
            self.bytecode.push(nox_shared::Opcode::JMP as i64);
            self.bytecode.push(main_offset as i64);
        }

        // Second pass: Merge and relocate
        for (i, res) in results.into_iter().enumerate() {
            let b_offset = bytecode_offsets[i];
            let s_offset = string_offsets[i];
            let mut module_bytecode = res.bytecode;

            // Relocate absolute jumps (loops, ifs)
            for &jump_pos in &res.jump_offsets {
                if jump_pos < module_bytecode.len() {
                    module_bytecode[jump_pos] += b_offset as i64;
                }
            }

            // Relocate string pool indices
            for &str_pos in &res.string_offsets {
                if str_pos < module_bytecode.len() {
                    module_bytecode[str_pos] += s_offset as i64;
                }
            }

            // Relocate function addresses for the global manifest
            for (name, mut info) in res.functions {
                info.address += b_offset;
                self.functions.insert(name, info);
            }

            // Collect call sites for final fixing
            let current_len = self.bytecode.len();
            for (call_pos, name) in res.function_calls {
                call_sites.push((current_len + call_pos, name));
            }

            self.bytecode.extend(module_bytecode);
            self.string_pool.extend(res.string_pool);
        }

        // Third Pass: Resolve function calls across all linked modules
        for (pos, name) in call_sites {
            if let Some(info) = self.functions.get(&name) {
                 self.bytecode[pos] = info.address as i64;
            } else {
                 // Might be a built-in handled by Opcode logic,
                 // but linker should only care about user functions.
            }
        }
    }
}
