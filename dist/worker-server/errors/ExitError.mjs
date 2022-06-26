class ExitError extends Error {
    constructor(code) {
        super(`Exit code: ${code}`);
        this.code = code;
    }
}

export { ExitError };
