import { Lexer, Parser, Compiler } from '@nox/frontend';
import { VM } from '@nox/runtime';

export interface ExecutionResult {
    success: boolean;
    logs: string[];
    error?: string;
}

export class ExecutionEngine {
    private compiler: Compiler;
    private vm: VM;

    constructor(initialPermissions?: { read: boolean, write: boolean, run: boolean }, whitelists?: { read: string[], write: string[], run: string[] }) {
        this.compiler = new Compiler();
        this.vm = new VM(initialPermissions || { read: false, write: false, run: false }, true);
        
        if (whitelists) {
            for (const path of whitelists.read) this.vm.addWhitelist('read', path);
            for (const path of whitelists.write) this.vm.addWhitelist('write', path);
            for (const path of whitelists.run) this.vm.addWhitelist('run', path);
        }
    }

    public execute(code: string): ExecutionResult {
        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser();
            const statements = parser.parse(tokens);
            
            const { bytecode, stringPool, startIp } = this.compiler.compileSnippet(statements);
            this.vm.runSnippet(bytecode, stringPool, startIp);
            
            const logs = [...this.vm.logs];
            // Clear VM logs after retrieving them for REPL consistency
            this.vm.logs.length = 0;
            
            return { success: true, logs };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            const logs = [...this.vm.logs];
            this.vm.logs.length = 0;
            return { success: false, logs, error: message };
        }
    }

    public reset(initialPermissions?: { read: boolean, write: boolean, run: boolean }, whitelists?: { read: string[], write: string[], run: string[] }) {
        this.compiler = new Compiler();
        this.vm = new VM(initialPermissions || { read: false, write: false, run: false }, true);
        if (whitelists) {
            for (const path of whitelists.read) this.vm.addWhitelist('read', path);
            for (const path of whitelists.write) this.vm.addWhitelist('write', path);
            for (const path of whitelists.run) this.vm.addWhitelist('run', path);
        }
    }
}
