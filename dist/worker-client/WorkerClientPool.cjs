'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var timeLimits = require('@flemist/time-limits');

class WorkerClientPool extends timeLimits.ObjectPool {
    constructor({ createClient, threadsPool, preInit, }) {
        super({
            pool: threadsPool,
            holdObjects: true,
            create: createClient,
            destroy: (client) => {
                return client.terminate();
            },
        });
        if (preInit) {
            void this.allocate();
        }
    }
    terminate() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this.availableObjects.forEach(o => {
                promises.push(Promise.resolve().then(() => o.terminate()));
            });
            this.holdObjects.forEach(o => {
                promises.push(Promise.resolve().then(() => o.terminate()));
            });
            yield Promise.all(promises);
        });
    }
}

exports.WorkerClientPool = WorkerClientPool;
