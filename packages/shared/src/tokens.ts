/**
 * Token types for the Lexer.
 */
export enum TokenType {
    NUMBER,
    STRING,
    IDENTIFIER,
    LET,
    IS,
    MUT,
    PRINT,
    IF,
    ELSE,
    WHILE,
    FOR,
    IN,
    FN,
    RETURN,
    MATCH,
    TRUE,
    FALSE,
    NULL,
    ARG_COUNT,
    GET_ARG,
    TO_NUMBER,
    READ_FILE,
    WRITE_FILE,
    FILE_EXISTS,
    STR_UPPER,
    STR_WORDS,
    READ_LINE,
    STR_AT,
    STR_LEN,
    RUN_CMD,
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
    GT_EQ,
    LT_EQ,
    EQ_EQ,
    BANG_EQ,
    AND_AND,
    OR_OR,
    PIPE,
    QUESTION_DOT,
    NULL_COAL,
    DOT_DOT,
    ARROW,
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