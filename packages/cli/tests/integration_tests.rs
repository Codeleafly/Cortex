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
async fn test_01_arithmetic() {
    let logs = run_file("test_01_arithmetic.nx").await;
    assert_eq!(logs, vec!["50"]);
}

#[tokio::test]
async fn test_02_strings() {
    let logs = run_file("test_02_strings.nx").await;
    assert_eq!(logs, vec!["hello nox"]);
}

#[tokio::test]
async fn test_03_logic() {
    let logs = run_file("test_03_logic.nx").await;
    assert_eq!(logs, vec!["0", "1", "0"]);
}

#[tokio::test]
async fn test_04_functions() {
    let logs = run_file("test_04_functions.nx").await;
    assert_eq!(logs, vec!["15"]);
}

#[tokio::test]
async fn test_05_loops() {
    let logs = run_file("test_05_loops.nx").await;
    assert_eq!(logs, vec!["3", "2", "1"]);
}

#[tokio::test]
async fn test_06_comments() {
    let logs = run_file("test_06_comments.nx").await;
    assert_eq!(logs, vec!["comment test"]);
}

#[tokio::test]
async fn test_07_ifelse() {
    let logs = run_file("test_07_ifelse.nx").await;
    assert_eq!(logs, vec!["then", "else2"]);
}
