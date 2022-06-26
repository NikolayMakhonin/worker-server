import { IWorkerEventBus, WorkerData } from '../common/contracts';
import { IAbortSignalFast } from "@flemist/abort-controller-fast";
export declare function workerRequest<TRequestData = any, TResponseData = any>({ eventBus, data, abortSignal, requestId, }: {
    eventBus: IWorkerEventBus<TRequestData, TResponseData>;
    data: WorkerData<TRequestData>;
    abortSignal?: IAbortSignalFast;
    requestId?: string;
}): Promise<WorkerData<TResponseData>>;
