'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_request_workerSubscribe = require('./workerSubscribe.cjs');
var workerServer_request_subscribeOnceAsPromise = require('./subscribeOnceAsPromise.cjs');
require('../common/route.cjs');
require('@flemist/async-utils');

function workerWait({ eventBus, requestId, abortSignal, }) {
    return workerServer_request_subscribeOnceAsPromise.subscribeOnceAsPromise({
        subscribe(callback) {
            return workerServer_request_workerSubscribe.workerSubscribe({
                eventBus,
                requestId,
                callback,
            });
        },
        abortSignal,
    });
}

exports.workerWait = workerWait;
