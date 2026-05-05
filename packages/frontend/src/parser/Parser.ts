import { Token } from '@nox/shared';
import { Stmt } from './AST.js';
import { StatementParser } from './StatementParser.js';

export class Parser extends StatementParser {
    constructor() {
        super();
    }

    public parse(tokens: Token[]): Stmt[] {
        this.tokens = tokens;
        this.pos = 0;
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }
}
