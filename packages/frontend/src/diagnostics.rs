use colored::*;

pub struct Diagnostic {
    pub file_path: String,
    pub source: String,
}

impl Diagnostic {
    pub fn new(file_path: String, source: String) -> Self {
        Self { file_path, source }
    }

    pub fn report_error(&self, line: usize, col: usize, message: &str, suggestion: Option<&str>) {
        println!("\n{} {}", "error:".red().bold(), message.bold());
        println!("  {} {}:{}:{}", "-->".blue().bold(), self.file_path, line, col);

        let lines: Vec<&str> = self.source.split('\n').collect();
        let start_line = if line > 2 { line - 2 } else { 0 };
        let end_line = if line + 2 <= lines.len() { line + 2 } else { lines.len() };

        println!("{}", "   |".blue().bold());
        for i in start_line..end_line {
            let current_line_num = i + 1;
            let line_content = if i < lines.len() { lines[i] } else { "" };

            if current_line_num == line {
                println!("{:>2} {} {}", current_line_num.to_string().blue().bold(), "|".blue().bold(), line_content);
                let padding = if col > 0 { " ".repeat(col - 1) } else { "".to_string() };
                println!("   {} {}{}", "|".blue().bold(), padding, "^".red().bold());
            } else {
                println!("{:>2} {} {}", current_line_num.to_string().blue().bold(), "|".blue().bold(), line_content);
            }
        }
        println!("{}", "   |".blue().bold());

        if let Some(sug) = suggestion {
            println!("   {} {}: {}", "=".blue().bold(), "help".bold(), sug);
        }
        println!();
    }
}
