'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var workerServer_common_getNextId = require('../common/getNextId.cjs');
var workerServer_request_workerSubscribe = require('./workerSubscribe.cjs');
var workerServer_request_workerRequest = require('./workerRequest.cjs');
require('worker_threads');
require('../common/route.cjs');
require('@flemist/async-utils');
require('./workerSend.cjs');
require('../common/createWorkerEvent.cjs');
require('./workerWait.cjs');
require('./subscribeOnceAsPromise.cjs');

function workerRequestSubscribe({ eventBus, data, abortSignal, callback, }) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const requestId = workerServer_common_getNextId.getNextId();
        let isFirstCallback = true;
        const unsubscribe = workerServer_request_workerSubscribe.workerSubscribe({
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
            const unsubscribeData = yield workerServer_request_workerRequest.workerRequest({
                eventBus,
                data,
                abortSignal,
                requestId,
            });
            return function unsubscribeAsync(_abortSignal) {
                return tslib.__awaiter(this, void 0, void 0, function* () {
                    unsubscribe();
                    yield workerServer_request_workerRequest.workerRequest({
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

exports.workerRequestSubscribe = workerRequestSubscribe;
