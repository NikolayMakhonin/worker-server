function routePush(route, connectionId) {
    if (!connectionId) {
        throw new Error('connectionId == null');
    }
    if (!route) {
        throw new Error('route == null');
    }
    route.push(connectionId);
    return route;
}
function routePop(route, connectionId) {
    if (!connectionId) {
        throw new Error('connectionId == null');
    }
    if (!route) {
        throw new Error('route == null');
    }
    const len = (route === null || route === void 0 ? void 0 : route.length) || 0;
    if (!len || route[len - 1] !== connectionId) {
        return false;
    }
    route.length = len - 1;
    return true;
}

export { routePop, routePush };
