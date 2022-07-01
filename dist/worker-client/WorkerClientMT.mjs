import { __awaiter } from 'tslib';
import { ObjectPool } from '@flemist/async-utils';

class WorkerClientMT {
    constructor({ createClient, threads, preInit, options, }) {
        this.options = options;
        this._createClient = createClient;
        this._clientPool = new ObjectPool({
            maxSize: threads || 1,
            holdObjects: true,
            create: () => {
                return this._createClient(this.options);
            },
            destroy: (client) => {
                return client.terminate();
            },
        });
        if (preInit) {
            void this.init();
        }
    }
    init() {
        return this._clientPool.allocate();
    }
    use(func, abortSignal) {
        return this._clientPool.use(func, abortSignal);
    }
    terminate() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this._clientPool.availableObjects.forEach(o => {
                promises.push(Promise.resolve().then(() => o.terminate()));
            });
            this._clientPool.holdObjects.forEach(o => {
                promises.push(Promise.resolve().then(() => o.terminate()));
            });
            yield Promise.all(promises);
        });
    }
}

export { WorkerClientMT };
