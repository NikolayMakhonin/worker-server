import {TransferListItem} from 'worker_threads'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

export type PromiseOrValue<T> = Promise<T> | T

export type TaskFunc<TRequest, TCallbackData, TResult> = (
  request: TRequest,
  abortSignal?: IAbortSignalFast,
  callback?: (data: TCallbackData) => void,
) => PromiseOrValue<TResult>

export type WorkerData<TData = any> = {
  data?: TData
  transferList?: ReadonlyArray<TransferListItem>
}

export type WorkerTaskFunc<TRequest, TCallbackData, TResult>
  = TaskFunc<WorkerData<TRequest>, WorkerData<TCallbackData>, WorkerData<TResult>>

export type WorkerTaskFuncResult<TResult> = PromiseOrValue<WorkerData<TResult>>


export type IUnsubscribe = () => void

export type IUnsubscribeAsync = (abortSignal: IAbortSignalFast) => PromiseOrValue<void>

export type Callback<TData = any, TError = Error> = (data: TData, error?: TError) => void

export interface IEventEmitter<TEmitEvent> {
  emit(event: TEmitEvent)
}
export interface IEventSubscriber<TSubscribeEvent> {
  subscribe(callback: (event: TSubscribeEvent) => void): IUnsubscribe
}
export interface IEventBus<TEmitEvent, TSubscribeEvent>
  extends IEventEmitter<TEmitEvent>, IEventSubscriber<TSubscribeEvent> { }

export type WorkerCallback<TData = any> = Callback<WorkerData<TData>>

export type WorkerEvent<TData = any> = {
  data?: WorkerData<TData>
  error?: Error
  route?: string[]
}

export interface IWorkerEventEmitter<TRequestData = any>
  extends IEventEmitter<WorkerEvent<TRequestData>> { }
export interface IWorkerEventSubscriber<TResponseData = any>
  extends IEventSubscriber<WorkerEvent<TResponseData>> { }
export interface IWorkerEventBus<TRequestData = any, TResponseData = any>
  extends IWorkerEventEmitter<TRequestData>, IWorkerEventSubscriber<TResponseData> { }

type WorkerFuncPromise<TRequestData = any, TResponseData = any> = (
  data: WorkerData<TRequestData>,
  abortSignal?: IAbortSignalFast,
) => PromiseOrValue<WorkerData<TResponseData>>

type WorkerFuncSubscribe<TRequestData = any, TResponseData = any> = (
  data: WorkerData<TRequestData>,
  abortSignal: IAbortSignalFast,
  callback: WorkerCallback<TResponseData>,
) => PromiseOrValue<IUnsubscribeAsync>

export type WorkerFunc<TRequestData = any, TResponseData = any>
  = WorkerFuncPromise<TRequestData, TResponseData>
  | WorkerFuncSubscribe<TRequestData, TResponseData>
