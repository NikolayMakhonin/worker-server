import { IWorkerEventSubscriber, WorkerData } from '../common/contracts';
import { IAbortSignalFast } from "@flemist/abort-controller-fast";
export declare function workerWait<TResponseData = any>({ eventBus, requestId, abortSignal, }: {
    eventBus: IWorkerEventSubscriber<TResponseData>;
    requestId: string;
    abortSignal?: IAbortSignalFast;
}): Promise<WorkerData<TResponseData>>;
