import { __awaiter } from 'tslib';
import { getNextId } from '../common/getNextId.mjs';
import { workerSubscribe } from './workerSubscribe.mjs';
import { workerRequest } from './workerRequest.mjs';
import 'worker_threads';
import '../common/route.mjs';
import '@flemist/async-utils';
import './workerSend.mjs';
import '../common/createWorkerEvent.mjs';
import './workerWait.mjs';
import './subscribeOnceAsPromise.mjs';
import '@flemist/abort-controller-fast';

function workerRequestSubscribe({ eventBus, data, abortSignal, callback, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestId = getNextId();
        let isFirstCallback = true;
        const unsubscribe = workerSubscribe({
            eventBus,
            requestId,
            callback(_data, error) {
                if (isFirstCallback) {
                    isFirstCallback = false;
                    return;
                }
                callback(_data, error);
            },
        });
        try {
            const unsubscribeData = yield workerRequest({
                eventBus,
                data,
                abortSignal,
                requestId,
            });
            return function unsubscribeAsync(_abortSignal) {
                return __awaiter(this, void 0, void 0, function* () {
                    unsubscribe();
                    yield workerRequest({
                        eventBus: eventBus,
                        data: unsubscribeData,
                        abortSignal: _abortSignal,
                        requestId,
                    });
                });
            };
        }
        catch (err) {
            unsubscribe();
            throw err;
        }
    });
}

export { workerRequestSubscribe };
