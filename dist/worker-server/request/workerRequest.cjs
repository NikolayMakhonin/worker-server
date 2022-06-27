'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var asyncUtils = require('@flemist/async-utils');
var workerServer_request_workerSend = require('./workerSend.cjs');
var workerServer_common_getNextId = require('../common/getNextId.cjs');
var workerServer_request_workerWait = require('./workerWait.cjs');
require('../common/createWorkerEvent.cjs');
require('worker_threads');
require('./workerSubscribe.cjs');
require('../common/route.cjs');
require('./subscribeOnceAsPromise.cjs');

function workerRequest({ eventBus, data, abortSignal, requestId, }) {
    return asyncUtils.useAbortController((signal) => {
        if (!requestId) {
            requestId = workerServer_common_getNextId.getNextId();
        }
        const promise = workerServer_request_workerWait.workerWait({
            eventBus,
            requestId,
            abortSignal: asyncUtils.combineAbortSignals(abortSignal, signal),
        });
        workerServer_request_workerSend.workerSend({
            eventEmitter: eventBus,
            data,
            requestId,
        });
        return promise;
    });
}

exports.workerRequest = workerRequest;
