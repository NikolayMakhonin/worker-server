'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_errors_ExitError = require('../errors/ExitError.cjs');
var workerServer_common_route = require('../common/route.cjs');

function workerToEventBus(worker) {
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
                worker.off('error', onError);
                worker.off('messageerror', onMessageError);
                worker.off('exit', onExit);
                worker.off('message', onMessage);
            }
            worker.setMaxListeners(100000);
            worker.on('error', onError);
            worker.on('messageerror', onMessageError);
            worker.on('exit', onExit);
            worker.on('message', onMessage);
            return unsubscribe;
        },
        emit(event) {
            var _a;
            worker.postMessage(event, (_a = event.data) === null || _a === void 0 ? void 0 : _a.transferList);
        },
    };
}

exports.workerToEventBus = workerToEventBus;
