'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_errors_ExitError = require('../errors/ExitError.cjs');
var workerServer_common_route = require('../common/route.cjs');
var workerServer_eventBus_helpers = require('./helpers.cjs');

function workerToEventBus(worker) {
    const listeners = {
        error: new Set(),
        messageerror: new Set(),
        exit: new Set(),
        message: new Set(),
    };
    // optimization: you should have native subscriptions as few as possible, because it works very slowly
    worker.on('error', workerServer_eventBus_helpers.createListener(listeners.error));
    worker.on('messageerror', workerServer_eventBus_helpers.createListener(listeners.messageerror));
    worker.on('exit', workerServer_eventBus_helpers.createListener(listeners.exit));
    worker.on('message', workerServer_eventBus_helpers.createListener(listeners.message));
    return {
        subscribe(callback) {
            function onError(error) {
                console.error(error);
            }
            function onMessageError(error) {
                console.error(error);
                callback({ error: error, route: [workerServer_common_route.ALL_CONNECTIONS] });
            }
            function onExit(code) {
                if (code) {
                    console.error(new workerServer_errors_ExitError.ExitError(code));
                }
                else {
                    console.warn(`Exit code: ${code}`);
                }
                callback({ error: new workerServer_errors_ExitError.ExitError(code), route: [workerServer_common_route.ALL_CONNECTIONS] });
            }
            function onMessage(event) {
                callback(event);
            }
            function unsubscribe() {
                listeners.error.delete(onError);
                listeners.messageerror.delete(onMessageError);
                listeners.exit.delete(onExit);
                listeners.message.delete(onMessage);
            }
            listeners.error.add(onError);
            listeners.messageerror.add(onMessageError);
            listeners.exit.add(onExit);
            listeners.message.add(onMessage);
            return unsubscribe;
        },
        emit(event) {
            var _a, _b;
            worker.postMessage(event, (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.transferList) === null || _b === void 0 ? void 0 : _b.filter(o => !(o instanceof SharedArrayBuffer)));
        },
    };
}

exports.workerToEventBus = workerToEventBus;
