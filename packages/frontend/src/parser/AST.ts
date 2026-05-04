import { Token } from '@nox/shared';

export type Stmt = 
    | LetStmt 
    | AssignStmt 
    | PrintStmt 
    | WhileStmt 
    | IfStmt 
    | FnStmt 
    | ReturnStmt 
    | ExprStmt;

export interface LetStmt {
    type: 'LetStmt';
    name: string;
    initializer: Expr;
}

export interface AssignStmt {
    type: 'AssignStmt';
    name: string;
    value: Expr;
}

export interface PrintStmt {
    type: 'PrintStmt';
    expression: Expr;
}

export interface WhileStmt {
    type: 'WhileStmt';
    condition: Expr;
    body: Stmt[];
}

export interface IfStmt {
    type: 'IfStmt';
    condition: Expr;
    thenBranch: Stmt[];
    elseBranch?: Stmt[];
}

export interface FnStmt {
    type: 'FnStmt';
    name: string;
    params: string[];
    body: Stmt[];
}

export interface ReturnStmt {
    type: 'ReturnStmt';
    value: Expr;
}

export interface ExprStmt {
    type: 'ExprStmt';
    expression: Expr;
}

export type Expr = 
    | BinaryExpr 
    | UnaryExpr 
    | LiteralExpr 
    | VariableExpr 
    | CallExpr 
    | GroupingExpr
    | ArgCountExpr;

export interface BinaryExpr {
    type: 'BinaryExpr';
    left: Expr;
    operator: Token;
    right: Expr;
}

export interface UnaryExpr {
    type: 'UnaryExpr';
    operator: Token;
    right: Expr;
}

export interface LiteralExpr {
    type: 'LiteralExpr';
    value: number | string | boolean | null;
}

export interface VariableExpr {
    type: 'VariableExpr';
    name: string;
}

export interface CallExpr {
    type: 'CallExpr';
    callee: string;
    args: Expr[];
}

export interface GroupingExpr {
    type: 'GroupingExpr';
    expression: Expr;
}

export interface ArgCountExpr {
    type: 'ArgCountExpr';
}
