import { IObjectPool, IPool, ObjectPool } from '@flemist/time-limits';
import { IWorkerClient } from './contracts';
interface IWorkerClientPool<TClient extends IWorkerClient> extends IObjectPool<TClient> {
    terminate(): Promise<void>;
}
export declare class WorkerClientPool<TClient extends IWorkerClient> extends ObjectPool<TClient> implements IWorkerClientPool<TClient> {
    protected constructor({ createClient, threadsPool, preInit, }: {
        createClient: () => Promise<TClient> | TClient;
        threadsPool: IPool;
        preInit: boolean;
    });
    terminate(): Promise<void>;
}
export {};
