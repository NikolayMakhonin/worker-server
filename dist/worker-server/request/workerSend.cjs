'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_common_createWorkerEvent = require('../common/createWorkerEvent.cjs');

function workerSend({ eventEmitter, data, requestId, }) {
    eventEmitter.emit(workerServer_common_createWorkerEvent.createWorkerEvent(data, void 0, requestId && [requestId]));
    return requestId;
}

exports.workerSend = workerSend;
