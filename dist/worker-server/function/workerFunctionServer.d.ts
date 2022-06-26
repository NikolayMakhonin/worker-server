/// <reference types="node" />
import { IUnsubscribe, IWorkerEventBus } from '../common/contracts';
import { TransferListItem } from 'worker_threads';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type PromiseOrValue<T> = Promise<T> | T;
export declare type TaskFunc<TRequest, TResult, TCallbackData> = (request: TRequest, abortSignal: IAbortSignalFast, callback: (data: TCallbackData) => void) => PromiseOrValue<TResult>;
export declare type WorkerData<TData = any> = {
    data?: TData;
    transferList?: ReadonlyArray<TransferListItem>;
};
export declare type WorkerTaskFunc<TRequest, TResult, TCallbackData> = TaskFunc<WorkerData<TRequest>, WorkerData<TResult>, WorkerData<TCallbackData>>;
export declare type WorkerFunctionServerResult<TResult> = PromiseOrValue<WorkerData<TResult>>;
export declare type TaskFunctionRequest<TRequest = any> = {
    task: string;
} & ({
    action: 'start';
    request: TRequest;
} | {
    action: 'abort';
    reason: any;
});
export declare type TaskFunctionResponse<TResult = any, TCallbackData = any> = {
    event: 'started';
} | {
    event: 'callback';
    data: TCallbackData;
} | {
    event: 'completed';
    result: TResult;
} | {
    event: 'error';
    error: any;
};
export declare type AbortFunc = (reason: any) => void;
export declare function workerFunctionServer<TRequest = any, TResult = any, TCallbackData = any>({ eventBus, task, name, }: {
    eventBus: IWorkerEventBus<TaskFunctionResponse<TResult, TCallbackData>, TaskFunctionRequest<TRequest>>;
    task: WorkerTaskFunc<TRequest, TResult, TCallbackData>;
    name?: string;
}): IUnsubscribe;
export declare type WorkerFunctionClient<TRequest = any, TResult = any, TCallbackData = any> = (request: WorkerData<TRequest>, abortSignal?: IAbortSignalFast, callback?: (data: WorkerData<TCallbackData>) => void) => Promise<WorkerData<TResult>>;
export declare function workerFunctionClient<TRequest = any, TResult = any, TCallbackData = any>({ eventBus, name, }: {
    eventBus: IWorkerEventBus<TaskFunctionRequest<TRequest>, TaskFunctionResponse<TResult, TCallbackData>>;
    name: string;
}): (request: WorkerData<TRequest>, abortSignal?: IAbortSignalFast, callback?: (data: WorkerData<TCallbackData>) => void) => Promise<WorkerData<TResult>>;