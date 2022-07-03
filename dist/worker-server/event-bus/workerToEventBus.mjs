import { ExitError } from '../errors/ExitError.mjs';
import { ALL_CONNECTIONS } from '../common/route.mjs';
import { createListener } from './helpers.mjs';

function workerToEventBus(worker) {
    const listeners = {
        error: new Set(),
        messageerror: new Set(),
        exit: new Set(),
        message: new Set(),
    };
    worker.on('error', createListener(listeners.error));
    worker.on('messageerror', createListener(listeners.messageerror));
    worker.on('exit', createListener(listeners.exit));
    worker.on('message', createListener(listeners.message));
    return {
        subscribe(callback) {
            function onError(error) {
                unsubscribe();
                console.error(error);
                callback({ error, route: [ALL_CONNECTIONS] });
            }
            function onMessageError(error) {
                unsubscribe();
                console.error(error);
                callback({ error, route: [ALL_CONNECTIONS] });
            }
            function onExit(code) {
                unsubscribe();
                const error = new ExitError(code);
                if (code) {
                    console.error(error);
                }
                else {
                    console.warn(`Exit code: ${code}`);
                }
                callback({ error, route: [ALL_CONNECTIONS] });
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

export { workerToEventBus };
