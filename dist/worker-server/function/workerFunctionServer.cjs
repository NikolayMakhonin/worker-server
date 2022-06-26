'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var workerServer_common_createWorkerEvent = require('../common/createWorkerEvent.cjs');
var workerServer_common_getNextId = require('../common/getNextId.cjs');
var workerServer_request_workerSend = require('../request/workerSend.cjs');
var workerServer_request_workerSubscribe = require('../request/workerSubscribe.cjs');
var abortControllerFast = require('@flemist/abort-controller-fast');
var asyncUtils = require('@flemist/async-utils');
require('worker_threads');
require('../common/route.cjs');

function serializeError(error) {
    return {
        error,
        props: error instanceof Error ? Object.assign({}, error) : void 0,
    };
}
function deserializeError(data) {
    if (data.error instanceof Error) {
        if (data.props.name === 'AbortError') {
            return new abortControllerFast.AbortError(data.error.message, data.props.reason);
        }
        return Object.assign(data.error, data.props);
    }
    return data.error;
}
function workerFunctionServer({ eventBus, task, name, }) {
    const abortMap = new Map();
    return eventBus.subscribe((event) => tslib.__awaiter(this, void 0, void 0, function* () {
        console.debug('server: ', event);
        function emitValue(data) {
            eventBus.emit(workerServer_common_createWorkerEvent.createWorkerEvent(data || {}, void 0, event.route));
        }
        function emitError(error) {
            eventBus.emit(workerServer_common_createWorkerEvent.createWorkerEvent(void 0, error, event.route));
        }
        if (event.error) {
            console.error(event.error);
            emitError(event.error);
            return;
        }
        if (!name) {
            name = task.name;
        }
        if (event.data.data.task !== name) {
            return;
        }
        try {
            const requestId = event.route[0];
            switch (event.data.data.action) {
                case 'start': {
                    let promiseOrResult;
                    try {
                        const abortController = new abortControllerFast.AbortControllerFast();
                        abortMap.set(requestId, function abort(reason) {
                            abortController.abort(reason);
                        });
                        promiseOrResult = task({
                            data: event.data.data.request,
                            transferList: event.data.transferList,
                        }, abortController.signal, function callback(data) {
                            emitValue({
                                data: {
                                    event: 'callback',
                                    data: data === null || data === void 0 ? void 0 : data.data,
                                },
                                transferList: data === null || data === void 0 ? void 0 : data.transferList,
                            });
                        });
                        let result;
                        if (promiseOrResult && typeof promiseOrResult.then === 'function') {
                            emitValue({
                                data: {
                                    event: 'started',
                                },
                            });
                            result = yield promiseOrResult;
                        }
                        else {
                            result = promiseOrResult;
                        }
                        emitValue({
                            data: {
                                event: 'completed',
                                result: result === null || result === void 0 ? void 0 : result.data,
                            },
                            transferList: result === null || result === void 0 ? void 0 : result.transferList,
                        });
                    }
                    catch (error) {
                        emitValue({
                            data: {
                                event: 'error',
                                error: serializeError(error),
                            },
                        });
                    }
                    finally {
                        abortMap.delete(requestId);
                    }
                    break;
                }
                case 'abort': {
                    const abort = abortMap.get(requestId);
                    if (abort) {
                        abortMap.delete(requestId);
                        abort(deserializeError(event.data.data.reason));
                    }
                    break;
                }
                default:
                    emitError(new Error('Unknown action: ' + event.data.data.action));
                    break;
            }
        }
        catch (error) {
            console.error(error);
            emitError(error);
        }
    }));
}
function workerFunctionClient({ eventBus, name, }) {
    function task(request, abortSignal, callback) {
        const abortController = new abortControllerFast.AbortControllerFast();
        return new Promise((_resolve, _reject) => {
            if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                reject(new abortControllerFast.AbortError());
                return;
            }
            const signal = asyncUtils.combineAbortSignals(abortController.signal, abortSignal);
            const requestId = workerServer_common_getNextId.getNextId();
            let unsubscribeEventBus;
            const unsubscribeAbortSignal = signal === null || signal === void 0 ? void 0 : signal.subscribe(abort);
            function unsubscribe() {
                if (unsubscribeAbortSignal) {
                    unsubscribeAbortSignal();
                }
                if (unsubscribeEventBus) {
                    unsubscribeEventBus();
                }
            }
            function resolve(data) {
                unsubscribe();
                _resolve(data);
            }
            function reject(err) {
                unsubscribe();
                _reject(err);
            }
            function abort() {
                try {
                    abortController.abort();
                    const reason = this.reason;
                    workerServer_request_workerSend.workerSend({
                        eventEmitter: eventBus,
                        data: {
                            data: {
                                task: name,
                                action: 'abort',
                                reason: serializeError(reason),
                            },
                            transferList: request === null || request === void 0 ? void 0 : request.transferList,
                        },
                        requestId,
                    });
                }
                catch (err) {
                    reject(err);
                }
            }
            try {
                unsubscribeEventBus = workerServer_request_workerSubscribe.workerSubscribe({
                    eventBus,
                    requestId,
                    callback(data, error) {
                        console.debug('client: ', data, error);
                        if (error) {
                            reject(error);
                            return;
                        }
                        switch (data.data.event) {
                            case 'started':
                                console.log('started: ' + name);
                                break;
                            case 'error':
                                deserializeError(data.data.error);
                                break;
                            case 'callback':
                                callback({
                                    data: data.data.data,
                                    transferList: data.transferList,
                                });
                                break;
                            case 'completed':
                                resolve({
                                    data: data.data.result,
                                    transferList: data.transferList,
                                });
                                break;
                            default:
                                throw new Error('Unknown event: ' + data.data.event);
                        }
                    },
                });
                workerServer_request_workerSend.workerSend({
                    eventEmitter: eventBus,
                    data: {
                        data: {
                            task: name,
                            action: 'start',
                            request: request === null || request === void 0 ? void 0 : request.data,
                        },
                        transferList: request === null || request === void 0 ? void 0 : request.transferList,
                    },
                    requestId,
                });
            }
            catch (err) {
                abortController.abort(err);
                unsubscribe();
                throw err;
            }
        });
    }
    Object.defineProperty(task, 'name', { value: name, writable: false });
    return task;
}

exports.workerFunctionClient = workerFunctionClient;
exports.workerFunctionServer = workerFunctionServer;
