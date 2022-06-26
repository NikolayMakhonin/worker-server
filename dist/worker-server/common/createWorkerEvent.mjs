function createWorkerEvent(data, error, route) {
    return {
        data,
        error,
        route,
    };
}

export { createWorkerEvent };
