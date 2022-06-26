import { CloseError } from '../errors/CloseError.mjs';

function messagePortToEventBus(messagePort) {
    return {
        subscribe(callback) {
            // function onError(error: Error) {
            //   console.error(error)
            // }
            function onMessageError(error) {
                console.error(error);
            }
            function onClose() {
                console.error(new CloseError());
            }
            function onMessage(event) {
                callback(event);
            }
            function unsubscribe() {
                messagePort.off('messageerror', onMessageError);
                messagePort.off('close', onClose);
                messagePort.off('message', onMessage);
            }
            messagePort.setMaxListeners(100000);
            messagePort.on('messageerror', onMessageError);
            messagePort.on('close', onClose);
            messagePort.on('message', onMessage);
            return unsubscribe;
        },
        emit(event) {
            var _a;
            messagePort.postMessage(event, (_a = event.data) === null || _a === void 0 ? void 0 : _a.transferList);
        },
    };
}

export { messagePortToEventBus };
