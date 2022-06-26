'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var abortControllerFast = require('@flemist/abort-controller-fast');

function subscribeOnceAsPromise({ subscribe, abortSignal, }) {
    return new Promise((_resolve, _reject) => {
        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
            throw new abortControllerFast.AbortError();
        }
        let unsubscribeEventBus;
        const unsubscribeAbortSignal = abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.subscribe(unsubscribe);
        function unsubscribe() {
            if (unsubscribeAbortSignal) {
                unsubscribeAbortSignal();
            }
            if (unsubscribeEventBus) {
                unsubscribeEventBus();
            }
        }
        function resolve(data) {
            unsubscribe();
            _resolve(data);
        }
        function reject(err) {
            unsubscribe();
            _reject(err);
        }
        try {
            unsubscribeEventBus = subscribe((data, error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        }
        catch (err) {
            unsubscribe();
            throw err;
        }
        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
            unsubscribe();
            throw new abortControllerFast.AbortError();
        }
    });
}

exports.subscribeOnceAsPromise = subscribeOnceAsPromise;
