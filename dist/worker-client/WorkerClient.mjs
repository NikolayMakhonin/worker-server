import { __awaiter } from 'tslib';
import { Worker } from 'worker_threads';
import { workerToEventBus } from '../worker-server/event-bus/workerToEventBus.mjs';
import '../worker-server/common/getNextId.mjs';
import '@flemist/abort-controller-fast';
import '@flemist/async-utils';
import path from 'path';
import '../worker-server/errors/ExitError.mjs';
import '../worker-server/common/route.mjs';
import '../worker-server/event-bus/helpers.mjs';

class WorkerClient {
    constructor({ workerFilePath, preInit, options, }) {
        this._worker = null;
        this._workerEventBus = null;
        this._workerFilePath = workerFilePath;
        this.options = options;
        if (preInit) {
            void this.init();
        }
    }
    init() {
        if (!this._initPromise) {
            this._initPromise = Promise.resolve().then(() => this.__init());
        }
        return this._initPromise;
    }
    __init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._worker = new Worker(path.resolve(this._workerFilePath));
            this._workerEventBus = workerToEventBus(this._worker);
            yield this._init(this._workerEventBus);
        });
    }
    terminate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._worker) {
                yield ((_a = this._worker) === null || _a === void 0 ? void 0 : _a.terminate());
                this._worker = null;
                this._workerEventBus = null;
                this._initPromise = null;
                yield this._terminate();
            }
        });
    }
}

export { WorkerClient };
