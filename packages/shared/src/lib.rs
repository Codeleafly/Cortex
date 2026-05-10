// Nox Shared Library (Rust)

#[allow(non_camel_case_types)]
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
#[repr(i64)]
pub enum Opcode {
    HALT = 0,
    PUSH = 1,
    ADD = 2,
    SUB = 3,
    MUL = 4,
    DIV = 5,
    LOAD = 6,
    STORE = 7,
    PRINT = 8,
    JMP = 9,
    JMP_IF_FALSE = 10,
    CMP_GT = 11,
    CMP_LT = 12,
    CMP_GE = 43,
    CMP_LE = 44,
    CMP_EQ = 13,
    CMP_NEQ = 32,
    POP = 14,
    PUSH_STR = 15,
    AND = 16,
    OR = 17,
    NOT = 18,
    RET = 19,
    CALL = 20,
    ARG_COUNT = 21,
    GET_ARG = 22,
    TO_NUMBER = 23,
    READ_FILE = 24,
    WRITE_FILE = 25,
    FILE_EXISTS = 26,
    STR_UPPER = 27,
    STR_WORDS = 28,
    READ_LINE = 29,
    STR_AT = 30,
    STR_LEN = 31,
    RUN_CMD = 33,
    JMP_IF_TRUE = 34,
    DUP = 35,
    RUN_CMD_ARGS = 36,
    DICT_BUILD = 37,
    DICT_GET = 38,
    DICT_SET = 39,
    AWAIT = 40,
    ITER_NEXT = 41,
    RANGE = 42,
    SLEEP = 45,
    HTTP_GET = 46,
    HTTP_POST = 47,
    JSON_PARSE = 48,
    JSON_STR = 49,
    OS_INFO = 50,
}

impl From<i64> for Opcode {
    fn from(val: i64) -> Self {
        unsafe { std::mem::transmute(val) }
    }
}

#[allow(non_camel_case_types)]
#[derive(Debug, PartialEq, Eq, Clone, Copy, Hash)]
pub enum TokenType {
    NUMBER,
    STRING,
    IDENTIFIER,
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
    UNDERSCORE,
    COLON,
    THIN_ARROW,
    SAY,
    ASK,
    INPUT,
    BANG_STRICT,
    IMPORT,
    FROM,
    EXPORT,
    EOF
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: Option<String>,
    pub line: usize,
    pub col: usize,
}

impl Token {
    pub fn new(token_type: TokenType, value: Option<String>, line: usize, col: usize) -> Self {
        Self { token_type, value, line, col }
    }
}

