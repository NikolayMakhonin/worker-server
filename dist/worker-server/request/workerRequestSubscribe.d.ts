import { IUnsubscribeAsync, IWorkerEventBus, WorkerCallback, WorkerData } from '../common/contracts';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare function workerRequestSubscribe<TSubscribeData = any, TCallbackData = any>({ eventBus, data, abortSignal, callback, }: {
    eventBus: IWorkerEventBus<TSubscribeData, TCallbackData>;
    data: WorkerData<TSubscribeData>;
    abortSignal?: IAbortSignalFast;
    callback: WorkerCallback<TCallbackData>;
}): Promise<IUnsubscribeAsync>;
