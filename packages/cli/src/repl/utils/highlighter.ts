import chalk from 'chalk';

const KEYWORDS = ['is', 'mut', 'fn', 'if', 'else', 'while', 'for', 'return', 'match', 'print', 'sleep'];
const OPERATORS = ['=', '+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '|>', '=>'];

export function highlight(code: string): string {
    let result = '';
    let i = 0;

    while (i < code.length) {
        const char = code[i];

        // String literals
        if (char === '"' || char === "'") {
            const quote = char;
            let str = quote;
            i++;
            while (i < code.length && code[i] !== quote) {
                if (code[i] === '\\') {
                    str += code[i];
                    i++;
                }
                str += code[i];
                i++;
            }
            if (i < code.length) {
                str += quote;
                i++;
            }
            result += chalk.yellow(str);
            continue;
        }

        // Numbers
        if (/[0-9]/.test(char)) {
            let num = '';
            while (i < code.length && /[0-9.]/.test(code[i])) {
                num += code[i];
                i++;
            }
            result += chalk.cyan(num);
            continue;
        }

        // Identifiers and Keywords
        if (/[a-zA-Z_]/.test(char)) {
            let id = '';
            while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                id += code[i];
                i++;
            }
            if (KEYWORDS.includes(id)) {
                result += chalk.blueBright.bold(id);
            } else {
                result += id;
            }
            continue;
        }

        // Operators
        let opFound = false;
        for (const op of [...OPERATORS].sort((a, b) => b.length - a.length)) {
            if (code.startsWith(op, i)) {
                result += chalk.red(op);
                i += op.length;
                opFound = true;
                break;
            }
        }
        if (opFound) continue;

        // Other characters (whitespace, parens, braces)
        result += char;
        i++;
    }

    return result;
}
