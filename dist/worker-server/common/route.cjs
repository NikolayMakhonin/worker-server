'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const ALL_CONNECTIONS = 'ALL_CONNECTIONS';
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
    if (!len || route[len - 1] !== connectionId && route[len - 1] !== ALL_CONNECTIONS) {
        return false;
    }
    route.length = len - 1;
    return true;
}

exports.ALL_CONNECTIONS = ALL_CONNECTIONS;
exports.routePop = routePop;
exports.routePush = routePush;
