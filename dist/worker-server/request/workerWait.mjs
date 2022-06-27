import { workerSubscribe } from './workerSubscribe.mjs';
import { subscribeOnceAsPromise } from './subscribeOnceAsPromise.mjs';
import '../common/route.mjs';

function workerWait({ eventBus, requestId, abortSignal, }) {
    return subscribeOnceAsPromise({
        subscribe(callback) {
            return workerSubscribe({
                eventBus,
                requestId,
                callback,
            });
        },
        abortSignal,
    });
}

export { workerWait };
