use std::path::PathBuf;
use std::fs;

async fn run_file(file_name: &str) -> Vec<String> {
    let path = PathBuf::from(format!("../../tests/nox/{}", file_name));
    let source = fs::read_to_string(&path).unwrap_or_else(|_| panic!("Failed to read {:?}", path));

    let mut lexer = nox_frontend::Lexer::new(&source);
    let tokens = lexer.tokenize();
    
    let mut parser = nox_frontend::Parser::new(tokens);
    let statements = parser.parse();
    
    let mut compiler = nox_frontend::Compiler::new();
    let result = compiler.compile(statements);
    
    let mut vm = nox_runtime::VM::new(nox_runtime::vm::Permissions::default(), true);
    vm.run(result.bytecode, result.string_pool, vec![]).await;
    
    vm.state.logs.clone()
}

#[tokio::test]
async fn test_01_basics() {
    let logs = run_file("test_01_basics.nx").await;
    assert_eq!(logs, vec!["Hello Nox"]);
}

#[tokio::test]
async fn test_02_logic() {
    let logs = run_file("test_02_logic.nx").await;
    assert_eq!(logs, vec!["ten"]);
}

#[tokio::test]
async fn test_03_loops() {
    let logs = run_file("test_03_loops.nx").await;
    assert_eq!(logs, vec!["1", "2", "3"]);
}

#[tokio::test]
async fn test_04_functions() {
    let logs = run_file("test_04_functions.nx").await;
    assert_eq!(logs, vec!["15"]);
}

#[tokio::test]
async fn test_05_strict() {
    let logs = run_file("test_05_strict.nx").await;
    assert_eq!(logs, vec!["10"]);
}
