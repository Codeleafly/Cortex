use clap::{Parser, Subcommand};
use colored::*;
use std::path::PathBuf;
use rustyline::error::ReadlineError;
use rustyline::DefaultEditor;
use nox_runtime::VM;
use nox_frontend::{Lexer, Parser as NoxParser, Compiler};

#[derive(Parser)]
#[command(name = "nox")]
#[command(about = "Nox Programming Language (Rust)", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    /// Path to a .nx file to run
    file: Option<PathBuf>,

    #[arg(long)]
    allow_read: bool,

    #[arg(long)]
    allow_write: bool,

    #[arg(long)]
    allow_run: bool,

    #[arg(long)]
    allow_all: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a Nox script
    Run {
        /// The file to run
        file: PathBuf,

        #[arg(long)]
        allow_read: bool,

        #[arg(long)]
        allow_write: bool,

        #[arg(long)]
        allow_run: bool,

        #[arg(long)]
        allow_all: bool,
    },
    /// Start the interactive REPL
    Repl,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Run { file, allow_read, allow_write, allow_run, allow_all }) => {
            let perms = get_perms(allow_read, allow_write, allow_run, allow_all);
            run_file(file, perms).await;
        }
        Some(Commands::Repl) => {
            run_repl().await;
        }
        None => {
            if let Some(file) = cli.file {
                let perms = get_perms(cli.allow_read, cli.allow_write, cli.allow_run, cli.allow_all);
                run_file(file, perms).await;
            } else {
                run_repl().await;
            }
        }
    }
}

fn get_perms(read: bool, write: bool, run: bool, all: bool) -> nox_runtime::vm::Permissions {
    if all {
        nox_runtime::vm::Permissions { read: true, write: true, run: true, network: true }
    } else {
        nox_runtime::vm::Permissions { read, write, run, network: false }
    }
}

async fn run_file(path: PathBuf, perms: nox_runtime::vm::Permissions) {
    let source = match std::fs::read_to_string(&path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{} {}: {}", "Error:".red().bold(), "Could not read file", e);
            return;
        }
    };

    let mut lexer = Lexer::new(&source);
    let tokens = lexer.tokenize();
    
    let mut parser = NoxParser::new(tokens);
    let statements = parser.parse();
    
    let mut vm = VM::new(perms, true);
    let mut final_compiler = Compiler::new();

    // Step 1: Resolve all modules recursively
    let mut resolved_sources = std::collections::HashSet::new();
    let mut pending_imports = Vec::new();
    let mut compilation_results: Vec<nox_frontend::CompilationResult> = Vec::new();

    for stmt in &statements {
        if let nox_frontend::ast::Stmt::Import { names, source } = stmt {
            pending_imports.push((names.clone(), source.clone()));
        }
    }

    while let Some((_names, source)) = pending_imports.pop() {
        if resolved_sources.contains(&source) { continue; }
        resolved_sources.insert(source.clone());

        let mod_path = vm.resolver.resolve(&source).await.expect("Module not found");
        let mod_source = std::fs::read_to_string(&mod_path).expect("Could not read module");

        let mut l = Lexer::new(&mod_source);
        let t = l.tokenize();
        let mut p = NoxParser::new(t);
        let s = p.parse();

        for stmt in &s {
            if let nox_frontend::ast::Stmt::Import { names, source: src } = stmt {
                pending_imports.push((names.clone(), src.clone()));
            }
        }

        let mut c = Compiler::new();
        // Propagate known functions to help resolving calls in this module
        for res in &compilation_results {
            for (name, info) in &res.functions {
                c.functions.insert(name.clone(), info.clone());
            }
        }

        c.compile_no_halt(s);
        let res = c.finish();

        for (name, info) in &res.functions {
             final_compiler.functions.insert(name.clone(), info.clone());
        }
        compilation_results.push(res);
    }

    final_compiler.compile_no_halt(statements);
    final_compiler.emit(nox_shared::Opcode::HALT as i64);
    let main_res = final_compiler.finish();

    let mut linker = nox_frontend::Linker::new();

    compilation_results.reverse();
    compilation_results.push(main_res);
    linker.link(compilation_results);

    vm.run(linker.bytecode, linker.string_pool, vec![]).await;
}

#[allow(dead_code)]
fn print_bytecode(bytecode: &[i64]) {
    println!("--- Bytecode Dump ---");
    let mut i = 0;
    while i < bytecode.len() {
        let op = nox_shared::Opcode::from(bytecode[i]);
        print!("{:04}: {:?}", i, op);
        println!(" (raw: {})", bytecode[i]);
        i += 1;
    }
}

async fn run_repl() {
    println!("{}", "Nox Interactive REPL (Rust)".cyan().bold());
    println!("Type '.exit' to quit, '.help' for help.\n");

    let mut rl = DefaultEditor::new().expect("Failed to create REPL editor");
    let mut vm = VM::new(nox_runtime::vm::Permissions { read: true, write: true, run: true, network: true }, true);
    let mut compiler = Compiler::new();

    let mut buffer = String::new();

    loop {
        let prompt = if buffer.is_empty() { "nox> ".magenta().to_string() } else { "... ".magenta().to_string() };
        let readline = rl.readline(&prompt);

        match readline {
            Ok(line) => {
                let _ = rl.add_history_entry(line.as_str());

                if line.trim() == ".exit" { break; }
                if line.trim() == ".help" {
                    println!("Nox REPL Help:");
                    println!("  .exit  - Exit REPL");
                    println!("  .help  - Show this help");
                    println!("  .reset - Reset environment");
                    continue;
                }
                if line.trim() == ".reset" {
                    vm = VM::new(nox_runtime::vm::Permissions { read: true, write: true, run: true, network: true }, true);
                    compiler = Compiler::new();
                    buffer.clear();
                    println!("Environment reset.");
                    continue;
                }

                buffer.push_str(&line);
                buffer.push('\n');

                if is_balanced(&buffer) {
                    let source = buffer.clone();
                    buffer.clear();

                    let mut lexer = Lexer::new(&source);
                    let tokens = lexer.tokenize();

                    let parser = NoxParser::new(tokens);
                    let statements = std::panic::catch_unwind(move || {
                        let mut p = parser;
                        p.parse()
                    });

                    match statements {
                        Ok(stmts) => {
                            let result = compiler.compile(stmts);
                            use futures::FutureExt;
                            let run_future = std::panic::AssertUnwindSafe(vm.run(result.bytecode, result.string_pool, vec![])).catch_unwind();
                            if let Err(_) = run_future.await {
                                eprintln!("{}", "Error: Runtime panic during execution".red());
                            }
                        }
                        Err(_) => {
                            eprintln!("{}", "Error: Parsing failed".red());
                        }
                    }
                }
            },
            Err(ReadlineError::Interrupted) | Err(ReadlineError::Eof) => {
                break;
            },
            Err(err) => {
                println!("Error: {:?}", err);
                break;
            }
        }
    }
}

fn is_balanced(code: &str) -> bool {
    let mut open_braces = 0;
    let mut open_parens = 0;
    let mut in_string = false;
    let mut string_char = '\0';
    let mut escaped = false;

    for c in code.chars() {
        if in_string {
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == string_char {
                in_string = false;
            }
        } else {
            match c {
                '"' | '\'' => {
                    in_string = true;
                    string_char = c;
                }
                '{' => open_braces += 1,
                '}' => open_braces -= 1,
                '(' => open_parens += 1,
                ')' => open_parens -= 1,
                _ => {}
            }
        }
    }

    open_braces <= 0 && open_parens <= 0 && !in_string
}
