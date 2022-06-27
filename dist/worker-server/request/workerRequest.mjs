import { useAbortController, combineAbortSignals } from '@flemist/async-utils';
import { workerSend } from './workerSend.mjs';
import { getNextId } from '../common/getNextId.mjs';
import { workerWait } from './workerWait.mjs';
import '../common/createWorkerEvent.mjs';
import 'worker_threads';
import './workerSubscribe.mjs';
import '../common/route.mjs';
import './subscribeOnceAsPromise.mjs';

function workerRequest({ eventBus, data, abortSignal, requestId, }) {
    return useAbortController((signal) => {
        if (!requestId) {
            requestId = getNextId();
        }
        const promise = workerWait({
            eventBus,
            requestId,
            abortSignal: combineAbortSignals(abortSignal, signal),
        });
        workerSend({
            eventEmitter: eventBus,
            data,
            requestId,
        });
        return promise;
    });
}

export { workerRequest };
