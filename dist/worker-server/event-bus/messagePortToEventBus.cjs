'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_errors_CloseError = require('../errors/CloseError.cjs');
var workerServer_eventBus_helpers = require('./helpers.cjs');
var workerServer_common_route = require('../common/route.cjs');

function messagePortToEventBus(messagePort) {
    const listeners = {
        messageerror: new Set(),
        close: new Set(),
        message: new Set(),
    };
    messagePort.on('messageerror', workerServer_eventBus_helpers.createListener(listeners.messageerror));
    messagePort.on('close', workerServer_eventBus_helpers.createListener(listeners.close));
    messagePort.on('message', workerServer_eventBus_helpers.createListener(listeners.message));
    return {
        subscribe(callback) {
            // function onError(error: Error) {
            //   console.error(error)
            // }
            function onMessageError(error) {
                unsubscribe();
                console.error(error);
                callback({ error, route: [workerServer_common_route.ALL_CONNECTIONS] });
            }
            function onClose() {
                unsubscribe();
                const error = new workerServer_errors_CloseError.CloseError();
                console.error(error);
                callback({ error, route: [workerServer_common_route.ALL_CONNECTIONS] });
            }
            function onMessage(event) {
                callback(event);
            }
            function unsubscribe() {
                listeners.messageerror.delete(onMessageError);
                listeners.close.delete(onClose);
                listeners.message.delete(onMessage);
            }
            listeners.messageerror.add(onMessageError);
            listeners.close.add(onClose);
            listeners.message.add(onMessage);
            return unsubscribe;
        },
        emit(event) {
            var _a, _b;
            messagePort.postMessage(event, (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.transferList) === null || _b === void 0 ? void 0 : _b.filter(o => !(o instanceof SharedArrayBuffer)));
        },
    };
}

exports.messagePortToEventBus = messagePortToEventBus;
