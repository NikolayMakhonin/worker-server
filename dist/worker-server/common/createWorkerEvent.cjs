'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createWorkerEvent(data, error, route) {
    return {
        data,
        error,
        route,
    };
}

exports.createWorkerEvent = createWorkerEvent;
