export class RuntimeError extends Error {
    constructor(message: string, public ip: number) {
        super(`Runtime Error at IP ${ip}: ${message}`);
        this.name = 'RuntimeError';
    }
}
