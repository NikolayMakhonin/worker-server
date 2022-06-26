import { IWorkerEventEmitter, WorkerData } from '../common/contracts';
export declare function workerSend<TRequest = any>({ eventEmitter, data, requestId, }: {
    eventEmitter: IWorkerEventEmitter<TRequest>;
    data: WorkerData<TRequest>;
    requestId?: string;
}): string;
