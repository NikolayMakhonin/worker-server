'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ExitError extends Error {
    constructor(code) {
        super(`Exit code: ${code}`);
        this.code = code;
    }
}

exports.ExitError = ExitError;
