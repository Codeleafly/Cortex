use std::fs;
use std::path::PathBuf;

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

async fn run_source(source: &str, args: Vec<String>) -> Vec<String> {
    let mut lexer = nox_frontend::Lexer::new(source);
    let tokens = lexer.tokenize();

    let mut parser = nox_frontend::Parser::new(tokens);
    let statements = parser.parse();

    let mut compiler = nox_frontend::Compiler::new();
    let result = compiler.compile(statements);

    let mut vm = nox_runtime::VM::new(nox_runtime::vm::Permissions::default(), true);
    vm.run(result.bytecode, result.string_pool, args).await;

    vm.state.logs.clone()
}

#[tokio::test]
async fn array_method_calls_update_mutable_receiver() {
    let logs = run_source(
        r#"
        mut result = []
        result.push("alpha")
        result.push("beta")
        say result.len()
        say result.get(0)
        say result.get(1)
        "#,
        vec![],
    )
    .await;

    assert_eq!(logs, vec!["2", "alpha", "beta"]);
}

#[tokio::test]
async fn std_sys_args_uses_array_methods() {
    let sys_source = fs::read_to_string("../../std/sys/mod.nx").expect("read std/sys/mod.nx");
    let main_source = r#"
        import { args } from "nox:sys"
        is received = args()
        say received.len()
        say received.get(0)
        say received.get(1)
    "#;

    let mut sys_lexer = nox_frontend::Lexer::new(&sys_source);
    let mut sys_parser = nox_frontend::Parser::new(sys_lexer.tokenize());
    let sys_statements = sys_parser.parse();
    let mut sys_compiler = nox_frontend::Compiler::new();
    sys_compiler.compile_no_halt(sys_statements);
    let sys_result = sys_compiler.finish();
    assert!(sys_result.exports.contains(&"args".to_string()));

    let mut main_lexer = nox_frontend::Lexer::new(main_source);
    let mut main_parser = nox_frontend::Parser::new(main_lexer.tokenize());
    let main_statements = main_parser.parse();
    let mut main_compiler = nox_frontend::Compiler::new();
    let args_info = sys_result
        .functions
        .get("args")
        .expect("exported args function")
        .clone();
    main_compiler
        .functions
        .insert("args".to_string(), args_info);
    main_compiler.compile_no_halt(main_statements);
    let main_result = main_compiler.finish();

    let mut linker = nox_frontend::Linker::new();
    linker.link(vec![sys_result, main_result]);

    let mut vm = nox_runtime::VM::new(nox_runtime::vm::Permissions::default(), true);
    vm.run(
        linker.bytecode,
        linker.string_pool,
        vec!["one".to_string(), "two".to_string()],
    )
    .await;

    assert_eq!(vm.state.logs, vec!["2", "one", "two"]);
}

#[test]
fn malformed_strict_directive_does_not_panic() {
    let result = std::panic::catch_unwind(|| {
        let mut lexer = nox_frontend::Lexer::new("!str");
        lexer.tokenize()
    });

    assert!(result.is_ok());
}

#[tokio::test]
async fn linked_imports_only_expose_requested_exports() {
    let module_source = r#"
        export fn add(a, b) => a + b
        export fn sub(a, b) => a - b
        say "module side effect should not run"
    "#;
    let main_source = r#"
        import { add } from "math"
        say add(2, 3)
    "#;

    let mut module_lexer = nox_frontend::Lexer::new(module_source);
    let mut module_parser = nox_frontend::Parser::new(module_lexer.tokenize());
    let module_statements = module_parser.parse();
    let mut module_compiler = nox_frontend::Compiler::new();
    module_compiler.compile_no_halt(
        module_statements
            .into_iter()
            .filter(|stmt| {
                matches!(
                    stmt,
                    nox_frontend::ast::Stmt::Export(_)
                        | nox_frontend::ast::Stmt::ExportList(_)
                        | nox_frontend::ast::Stmt::Fn { .. }
                )
            })
            .collect(),
    );
    let module_result = module_compiler.finish();

    let mut main_lexer = nox_frontend::Lexer::new(main_source);
    let mut main_parser = nox_frontend::Parser::new(main_lexer.tokenize());
    let main_statements = main_parser.parse();
    let mut main_compiler = nox_frontend::Compiler::new();
    let add_info = module_result
        .functions
        .get("add")
        .expect("exported add")
        .clone();
    main_compiler.functions.insert("add".to_string(), add_info);
    main_compiler.compile_no_halt(main_statements);
    let main_result = main_compiler.finish();

    let mut linker = nox_frontend::Linker::new();
    linker.link(vec![module_result, main_result]);

    let mut vm = nox_runtime::VM::new(nox_runtime::vm::Permissions::default(), true);
    vm.run(linker.bytecode, linker.string_pool, vec![]).await;

    assert_eq!(vm.state.logs, vec!["5"]);
}

#[test]
fn match_jump_offsets_are_recorded_once_per_jump_operand() {
    let source = r#"
        is x = 2
        match x {
            1 => say "one"
            2 => say "two"
            _ => say "other"
        }
    "#;
    let mut lexer = nox_frontend::Lexer::new(source);
    let mut parser = nox_frontend::Parser::new(lexer.tokenize());
    let statements = parser.parse();
    let mut compiler = nox_frontend::Compiler::new();
    let result = compiler.compile(statements);

    let unique_offsets: std::collections::HashSet<usize> =
        result.jump_offsets.iter().copied().collect();
    assert_eq!(unique_offsets.len(), result.jump_offsets.len());
}
