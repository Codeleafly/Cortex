pub mod tokens;
pub mod utils;

use nox_shared::TokenType;
use std::collections::HashMap;

pub struct Lexer {
    pub source: Vec<char>,
    pub pos: usize,
    pub line: usize,
    pub col: usize,
    pub keywords: HashMap<String, TokenType>,
}

impl Lexer {
    pub fn new(source: &str) -> Self {
        let mut keywords = HashMap::new();
        keywords.insert("is".to_string(), TokenType::IS);
        keywords.insert("mut".to_string(), TokenType::MUT);
        keywords.insert("print".to_string(), TokenType::PRINT);
        keywords.insert("if".to_string(), TokenType::IF);
        keywords.insert("else".to_string(), TokenType::ELSE);
        keywords.insert("while".to_string(), TokenType::WHILE);
        keywords.insert("for".to_string(), TokenType::FOR);
        keywords.insert("in".to_string(), TokenType::IN);
        keywords.insert("fn".to_string(), TokenType::FN);
        keywords.insert("return".to_string(), TokenType::RETURN);
        keywords.insert("match".to_string(), TokenType::MATCH);
        keywords.insert("true".to_string(), TokenType::TRUE);
        keywords.insert("false".to_string(), TokenType::FALSE);
        keywords.insert("null".to_string(), TokenType::NULL);
        keywords.insert("arg_count".to_string(), TokenType::ARG_COUNT);
        keywords.insert("get_arg".to_string(), TokenType::GET_ARG);
        keywords.insert("to_number".to_string(), TokenType::TO_NUMBER);
        keywords.insert("read_file".to_string(), TokenType::READ_FILE);
        keywords.insert("write_file".to_string(), TokenType::WRITE_FILE);
        keywords.insert("file_exists".to_string(), TokenType::FILE_EXISTS);
        keywords.insert("str_upper".to_string(), TokenType::STR_UPPER);
        keywords.insert("str_words".to_string(), TokenType::STR_WORDS);
        keywords.insert("read_line".to_string(), TokenType::READ_LINE);
        keywords.insert("str_at".to_string(), TokenType::STR_AT);
        keywords.insert("str_len".to_string(), TokenType::STR_LEN);
        keywords.insert("run_command".to_string(), TokenType::RUN_CMD);

        Self {
            source: source.chars().collect(),
            pos: 0,
            line: 1,
            col: 1,
            keywords,
        }
    }

    pub fn is_at_end(&self) -> bool {
        self.pos >= self.source.len()
    }

    pub fn peek(&self) -> char {
        if self.is_at_end() { '\0' } else { self.source[self.pos] }
    }

    pub fn peek_next(&self) -> char {
        if self.pos + 1 >= self.source.len() { '\0' } else { self.source[self.pos + 1] }
    }

    pub fn advance(&mut self) -> char {
        let c = self.source[self.pos];
        self.pos += 1;
        self.col += 1;
        c
    }
}
