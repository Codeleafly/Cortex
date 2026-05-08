use nox_shared::Token;

#[derive(Debug, Clone)]
pub enum Stmt {
    Let { name: String, initializer: Expr, is_mutable: bool },
    Assign { name: String, value: Expr },
    Print { expression: Expr },
    While { condition: Expr, body: Vec<Stmt> },
    For { item: String, iterable: Expr, body: Vec<Stmt> },
    If { condition: Expr, then_branch: Vec<Stmt>, else_branch: Option<Vec<Stmt>> },
    Match { expression: Expr, cases: Vec<(Option<Expr>, Vec<Stmt>)> },
    Fn { name: String, params: Vec<String>, body: Vec<Stmt> },
    Return { value: Expr },
    Expr(Expr),
}

#[derive(Debug, Clone)]
pub enum Expr {
    Binary { left: Box<Expr>, operator: Token, right: Box<Expr> },
    Unary { operator: Token, right: Box<Expr>, is_prefix: bool },
    Literal(LiteralValue),
    Variable(String),
    Call { callee: String, args: Vec<Expr> },
    Grouping(Box<Expr>),
    ArgCount,
    Dict(Vec<(String, Expr)>),
    Range { start: Box<Expr>, end: Box<Expr> },
    Pipe { left: Box<Expr>, right: Box<Expr> },
    SafeCall { left: Box<Expr>, right: String },
    NullCoalesce { left: Box<Expr>, right: Box<Expr> },
}

#[derive(Debug, Clone, PartialEq)]
pub enum LiteralValue {
    Number(i64),
    String(String),
    Boolean(bool),
    Null,
}
