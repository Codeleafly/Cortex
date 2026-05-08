use clap::{Parser, Subcommand};
use colored::*;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "nox")]
#[command(about = "Nox Programming Language (Rust)", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    /// Path to a .nx file to run
    file: Option<PathBuf>,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a Nox script
    Run {
        /// The file to run
        file: PathBuf,
    },
    /// Start the interactive REPL
    Repl,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Run { file }) => {
            run_file(file).await;
        }
        Some(Commands::Repl) => {
            println!("{}", "REPL not yet implemented in Rust".yellow());
        }
        None => {
            if let Some(file) = cli.file {
                run_file(file).await;
            } else {
                println!("{}", "Welcome to Nox (Rust)".cyan().bold());
                println!("Use 'nox run <file>' or 'nox repl'");
            }
        }
    }
}

async fn run_file(path: PathBuf) {
    let source = match std::fs::read_to_string(&path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{} {}: {}", "Error:".red().bold(), "Could not read file", e);
            return;
        }
    };

    let mut lexer = nox_frontend::Lexer::new(&source);
    let tokens = lexer.tokenize();
    
    let mut parser = nox_frontend::Parser::new(tokens);
    let statements = parser.parse();
    
    let mut compiler = nox_frontend::Compiler::new();
    let result = compiler.compile(statements);
    
    let mut vm = nox_runtime::VM::new(nox_runtime::vm::Permissions::default(), true);
    vm.run(result.bytecode, result.string_pool, vec![]).await;
}
