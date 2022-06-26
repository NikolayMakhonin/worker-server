import { createWorkerEvent } from '../common/createWorkerEvent.mjs';

function workerSend({ eventEmitter, data, requestId, }) {
    eventEmitter.emit(createWorkerEvent(data, void 0, requestId && [requestId]));
    return requestId;
}

export { workerSend };
