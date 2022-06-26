/// <reference types="node" />
import { TransferListItem } from 'worker_threads';
import { IAbortSignalFast } from "@flemist/abort-controller-fast";
export declare type PromiseOrValue<T> = Promise<T> | T;
export declare type TaskFunc<TRequest, TCallbackData, TResult> = (request: TRequest, abortSignal?: IAbortSignalFast, callback?: (data: TCallbackData) => void) => PromiseOrValue<TResult>;
export declare type WorkerData<TData = any> = {
    data?: TData;
    transferList?: ReadonlyArray<TransferListItem>;
};
export declare type WorkerTaskFunc<TRequest, TCallbackData, TResult> = TaskFunc<WorkerData<TRequest>, WorkerData<TCallbackData>, WorkerData<TResult>>;
export declare type WorkerTaskFuncResult<TResult> = PromiseOrValue<WorkerData<TResult>>;
export declare type IUnsubscribe = () => void;
export declare type IUnsubscribeAsync = (abortSignal: IAbortSignalFast) => PromiseOrValue<void>;
export declare type Callback<TData = any, TError = Error> = (data: TData, error?: TError) => void;
export interface IEventEmitter<TEmitEvent> {
    emit(event: TEmitEvent): any;
}
export interface IEventSubscriber<TSubscribeEvent> {
    subscribe(callback: (event: TSubscribeEvent) => void): IUnsubscribe;
}
export interface IEventBus<TEmitEvent, TSubscribeEvent> extends IEventEmitter<TEmitEvent>, IEventSubscriber<TSubscribeEvent> {
}
export declare type WorkerCallback<TData = any> = Callback<WorkerData<TData>>;
export declare type WorkerEvent<TData = any> = {
    data?: WorkerData<TData>;
    error?: Error;
    route?: string[];
};
export interface IWorkerEventEmitter<TRequestData = any> extends IEventEmitter<WorkerEvent<TRequestData>> {
}
export interface IWorkerEventSubscriber<TResponseData = any> extends IEventSubscriber<WorkerEvent<TResponseData>> {
}
export interface IWorkerEventBus<TRequestData = any, TResponseData = any> extends IWorkerEventEmitter<TRequestData>, IWorkerEventSubscriber<TResponseData> {
}
declare type WorkerFuncPromise<TRequestData = any, TResponseData = any> = (data: WorkerData<TRequestData>, abortSignal?: IAbortSignalFast) => PromiseOrValue<WorkerData<TResponseData>>;
declare type WorkerFuncSubscribe<TRequestData = any, TResponseData = any> = (data: WorkerData<TRequestData>, abortSignal: IAbortSignalFast, callback: WorkerCallback<TResponseData>) => PromiseOrValue<IUnsubscribeAsync>;
export declare type WorkerFunc<TRequestData = any, TResponseData = any> = WorkerFuncPromise<TRequestData, TResponseData> | WorkerFuncSubscribe<TRequestData, TResponseData>;
export {};
