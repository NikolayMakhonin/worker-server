import {IUnsubscribe, IWorkerEventBus} from '../common/contracts'
import {createWorkerEvent} from '../common/createWorkerEvent'
import {TransferListItem} from 'worker_threads'
import {getNextId} from '../common/getNextId'
import {workerSend} from '../request/workerSend'
import {workerSubscribe} from '../request/workerSubscribe'
import {AbortError, AbortControllerFast, IAbortSignalFast} from '@flemist/abort-controller-fast'
import {combineAbortSignals, rejectAsResolve} from '@flemist/async-utils'

type ErrorSerialized = {
  error: any,
  props: any,
}

function serializeError(error: any): ErrorSerialized {
  return {
    error,
    props: error instanceof Error ? {...error} : void 0,
  }
}

function deserializeError(data: ErrorSerialized) {
  if (data.error instanceof Error) {
    if (data.props.name === 'AbortError') {
      return new AbortError(data.error.message, data.props.reason)
    }
    return Object.assign(data.error, data.props)
  }
  return data.error
}

export type PromiseOrValue<T> = Promise<T> | T

export type TaskFunc<TRequest, TResult, TCallbackData> = (
  request: TRequest,
  abortSignal: IAbortSignalFast,
  callback: (data: TCallbackData) => void,
) => PromiseOrValue<TResult>

export type WorkerData<TData = any> = {
  data?: TData
  transferList?: ReadonlyArray<TransferListItem>
}

export type WorkerTaskFunc<TRequest, TResult, TCallbackData>
  = TaskFunc<WorkerData<TRequest>, WorkerData<TResult>, WorkerData<TCallbackData>>

export type WorkerFunctionServerResult<TResult> = PromiseOrValue<WorkerData<TResult>>
export type WorkerFunctionServerResultSync<TResult> = WorkerData<TResult>
export type WorkerFunctionServerResultAsync<TResult> = Promise<WorkerData<TResult>>

export type TaskFunctionRequest<TRequest = any> = {
  task: string,
} & ({
  action: 'start',
  request: TRequest,
} | {
  action: 'abort',
  reason: any,
})

export type TaskFunctionResponse<TResult = any, TCallbackData = any> = {
  event: 'started',
} | {
  event: 'callback',
  data: TCallbackData,
} | {
  event: 'completed',
  result: TResult,
} | {
  event: 'error',
  error: ErrorSerialized,
}

export type AbortFunc = (reason: any) => void

export type WorkerFunctionServerEventBus<TRequest = any, TResult = any, TCallbackData = any> = IWorkerEventBus<
  TaskFunctionResponse<TResult, TCallbackData>,
  TaskFunctionRequest<TRequest>
>

export function workerFunctionServer<TRequest = any, TResult = any, TCallbackData = any>({
  eventBus,
  task,
  name,
  debug,
}: {
  eventBus: WorkerFunctionServerEventBus<TRequest, TResult, TCallbackData>,
  task: WorkerTaskFunc<TRequest, TResult, TCallbackData>,
  name?: string,
  debug?: boolean,
}) {
  const abortMap = new Map<string, AbortFunc>()

  return eventBus.subscribe(async (event) => {
    if (debug) {
      console.debug('server: ', event)
    }
    function emitValue(data: WorkerData<TaskFunctionResponse<TResult, TCallbackData>>) {
      eventBus.emit(createWorkerEvent(
        data || {},
        void 0,
        event.route,
      ))
    }

    function emitError(error?: Error) {
      eventBus.emit(createWorkerEvent(
        void 0,
        error,
        event.route,
      ))
    }

    if (event.error) {
      console.error(event.error)
      emitError(event.error)
      return
    }

    if (!name) {
      name = task.name
    }

    if (event.data.data.task !== name) {
      return
    }

    try {
      const requestId = event.route[0]

      switch (event.data.data.action) {
        case 'start': {
          let promiseOrResult: PromiseOrValue<WorkerData<TResult>>
          try {
            const abortController = new AbortControllerFast()
            abortMap.set(requestId, function abort(reason: any) {
              abortController.abort(reason)
            })

            promiseOrResult = task(
              {
                data        : event.data.data.request,
                transferList: event.data.transferList,
              },
              abortController.signal,
              function callback(data) {
                emitValue({
                  data: {
                    event: 'callback',
                    data : data?.data,
                  },
                  transferList: data?.transferList,
                })
              },
            )

            let result: WorkerData<TResult>
            if (promiseOrResult && typeof (promiseOrResult as Promise<any>).then === 'function') {
              emitValue({
                data: {
                  event: 'started',
                },
              })

              result = await promiseOrResult
            }
            else {
              result = promiseOrResult as WorkerData<TResult>
            }

            emitValue({
              data: {
                event : 'completed',
                result: result?.data,
              },
              transferList: result?.transferList,
            })
          }
          catch (error) {
            emitValue({
              data: {
                event: 'error',
                error: serializeError(error),
              },
            })
          }
          finally {
            abortMap.delete(requestId)
          }
          break
        }
        case 'abort': {
          const abort = abortMap.get(requestId)
          if (abort) {
            abortMap.delete(requestId)
            abort(deserializeError(event.data.data.reason))
          }
          break
        }
        default:
          emitError(new Error('Unknown action: ' + (event.data.data as any).action))
          break
      }
    }
    catch (error) {
      console.error(error)
      emitError(error)
    }
  })
}

export type WorkerFunctionClientEventBus<TRequest = any, TResult = any, TCallbackData = any> = IWorkerEventBus<
  TaskFunctionRequest<TRequest>,
  TaskFunctionResponse<TResult, TCallbackData>
  >

export type WorkerFunctionClient<TRequest = any, TResult = any, TCallbackData = any> = (
  request: WorkerData<TRequest>,
  abortSignal?: IAbortSignalFast,
  callback?: (data: WorkerData<TCallbackData>) => void,
) => Promise<WorkerData<TResult>>

export function workerFunctionClient<TRequest = any, TResult = any, TCallbackData = any>({
  eventBus,
  name,
  debug,
}: {
  eventBus: WorkerFunctionClientEventBus<TRequest, TResult, TCallbackData>,
  name: string,
  debug?: boolean,
}) {
  function task(
    request: WorkerData<TRequest>,
    abortSignal?: IAbortSignalFast,
    callback?: (data: WorkerData<TCallbackData>) => void,
  ): Promise<WorkerData<TResult>> {
    const abortController = new AbortControllerFast()
    return new Promise<WorkerData<TResult>>((_resolve) => {
      if (abortSignal?.aborted) {
        reject(abortSignal.reason)
        return
      }
      const signal = combineAbortSignals(abortController.signal, abortSignal)

      const requestId = getNextId()

      let unsubscribeEventBus: IUnsubscribe

      const unsubscribeAbortSignal = signal?.subscribe(abort)

      function unsubscribe() {
        if (unsubscribeAbortSignal) {
          unsubscribeAbortSignal()
        }
        if (unsubscribeEventBus) {
          unsubscribeEventBus()
        }
      }

      function resolve(data: WorkerData<TResult>) {
        unsubscribe()
        _resolve(data)
      }

      function reject(err: Error) {
        unsubscribe()
        rejectAsResolve(_resolve, err)
      }

      function abort(this: IAbortSignalFast) {
        try {
          abortController.abort()

          const reason = (this as any).reason

          workerSend<TaskFunctionRequest<TRequest>>({
            eventEmitter: eventBus,
            data        : {
              data: {
                task  : name,
                action: 'abort',
                reason: serializeError(reason),
              },
              transferList: request?.transferList,
            },
            requestId,
          })
        }
        catch (err) {
          reject(err)
        }
      }

      try {
        unsubscribeEventBus = workerSubscribe({
          eventBus,
          requestId,
          callback(data, error) {
            if (debug) {
              console.debug('client: ', data, error)
            }
            if (error) {
              reject(error)
              return
            }
            switch (data.data.event) {
              case 'started':
                if (debug) {
                  console.debug('started: ' + name)
                }
                break
              case 'error':
                reject(deserializeError(data.data.error))
                break
              case 'callback':
                callback({
                  data        : data.data.data,
                  transferList: data.transferList,
                })
                break
              case 'completed':
                resolve({
                  data        : data.data.result,
                  transferList: data.transferList,
                })
                break
              default:
                throw new Error('Unknown event: ' + (data.data as any).event)
            }
          },
        })

        workerSend<TaskFunctionRequest<TRequest>>({
          eventEmitter: eventBus,
          data        : {
            data: {
              task   : name,
              action : 'start',
              request: request?.data,
            },
            transferList: request?.transferList,
          },
          requestId,
        })
      }
      catch (err) {
        abortController.abort(err)
        unsubscribe()
        throw err
      }
    })
  }
  Object.defineProperty(task, 'name', {value: name, writable: false})
  return task
}
