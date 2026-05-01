/**
 * Token types for the Lexer.
 */
export enum TokenType {
    NUMBER,
    STRING,
    IDENTIFIER,
    LET,
    PRINT,
    IF,
    WHILE,
    FN,
    RETURN,
    TRUE,
    FALSE,
    NULL,
    ARG_COUNT,
    GET_ARG,
    TO_NUMBER,
    LBRACE,
    RBRACE,
    LPAREN,
    RPAREN,
    COMMA,
    EQUALS,
    PLUS,
    MINUS,
    STAR,
    SLASH,
    GT,
    LT,
    EQ_EQ,
    AND_AND,
    OR_OR,
    BANG,
    SEMICOLON,
    EOF
}

export interface Token {
    type: TokenType;
    value?: string;
    line: number;
    col: number;
}