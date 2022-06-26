import { IUnsubscribe, IWorkerEventSubscriber, WorkerCallback } from '../common/contracts';
export declare function workerSubscribe<TResponseData = any>({ eventBus, requestId, callback, }: {
    eventBus: IWorkerEventSubscriber<TResponseData>;
    requestId: string;
    callback: WorkerCallback<TResponseData>;
}): IUnsubscribe;
