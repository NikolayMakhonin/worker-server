import { CloseError } from '../errors/CloseError.mjs';
import { createListener } from './helpers.mjs';
import { ALL_CONNECTIONS } from '../common/route.mjs';

function messagePortToEventBus(messagePort) {
    const listeners = {
        messageerror: new Set(),
        close: new Set(),
        message: new Set(),
    };
    messagePort.on('messageerror', createListener(listeners.messageerror));
    messagePort.on('close', createListener(listeners.close));
    messagePort.on('message', createListener(listeners.message));
    return {
        subscribe(callback) {
            // function onError(error: Error) {
            //   console.error(error)
            // }
            function onMessageError(error) {
                unsubscribe();
                console.error(error);
                callback({ error, route: [ALL_CONNECTIONS] });
            }
            function onClose() {
                unsubscribe();
                const error = new CloseError();
                console.error(error);
                callback({ error, route: [ALL_CONNECTIONS] });
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

export { messagePortToEventBus };
