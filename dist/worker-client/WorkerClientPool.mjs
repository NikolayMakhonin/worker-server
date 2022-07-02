import { __awaiter } from 'tslib';
import { ObjectPool } from '@flemist/time-limits';

class WorkerClientPool extends ObjectPool {
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
    init() {
        return this.allocate();
    }
    terminate() {
        return __awaiter(this, void 0, void 0, function* () {
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

export { WorkerClientPool };
