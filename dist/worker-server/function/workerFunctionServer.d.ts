/// <reference types="node" />
import { IUnsubscribe, IWorkerEventBus } from '../common/contracts';
import { TransferListItem } from 'worker_threads';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
declare type ErrorSerialized = {
    error: any;
    props: any;
};
export declare type PromiseOrValue<T> = Promise<T> | T;
export declare type TaskFunc<TRequest, TResult, TCallbackData> = (request: TRequest, abortSignal: IAbortSignalFast, callback: (data: TCallbackData) => void) => PromiseOrValue<TResult>;
export declare type WorkerData<TData = any> = {
    data?: TData;
    transferList?: ReadonlyArray<TransferListItem>;
};
export declare type WorkerTaskFunc<TRequest, TResult, TCallbackData> = TaskFunc<WorkerData<TRequest>, WorkerData<TResult>, WorkerData<TCallbackData>>;
export declare type WorkerFunctionServerResult<TResult> = PromiseOrValue<WorkerData<TResult>>;
export declare type WorkerFunctionServerResultAsync<TResult> = Promise<WorkerData<TResult>>;
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
    error: ErrorSerialized;
};
export declare type AbortFunc = (reason: any) => void;
export declare type WorkerFunctionServerEventBus<TRequest = any, TResult = any, TCallbackData = any> = IWorkerEventBus<TaskFunctionResponse<TResult, TCallbackData>, TaskFunctionRequest<TRequest>>;
export declare function workerFunctionServer<TRequest = any, TResult = any, TCallbackData = any>({ eventBus, task, name, }: {
    eventBus: WorkerFunctionServerEventBus<TRequest, TResult, TCallbackData>;
    task: WorkerTaskFunc<TRequest, TResult, TCallbackData>;
    name?: string;
}): IUnsubscribe;
export declare type WorkerFunctionClientEventBus<TRequest = any, TResult = any, TCallbackData = any> = IWorkerEventBus<TaskFunctionRequest<TRequest>, TaskFunctionResponse<TResult, TCallbackData>>;
export declare type WorkerFunctionClient<TRequest = any, TResult = any, TCallbackData = any> = (request: WorkerData<TRequest>, abortSignal?: IAbortSignalFast, callback?: (data: WorkerData<TCallbackData>) => void) => Promise<WorkerData<TResult>>;
export declare function workerFunctionClient<TRequest = any, TResult = any, TCallbackData = any>({ eventBus, name, }: {
    eventBus: WorkerFunctionClientEventBus<TRequest, TResult, TCallbackData>;
    name: string;
}): (request: WorkerData<TRequest>, abortSignal?: IAbortSignalFast, callback?: (data: WorkerData<TCallbackData>) => void) => Promise<WorkerData<TResult>>;
export {};
