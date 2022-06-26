import {IUnsubscribeAsync, IWorkerEventBus, WorkerCallback, WorkerData} from '../common/contracts'
import {getNextId} from '../common/getNextId'
import {workerSubscribe} from './workerSubscribe'
import {workerRequest} from './workerRequest'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

export async function workerRequestSubscribe<
  TSubscribeData = any,
  TCallbackData = any,
>({
  eventBus,
  data,
  abortSignal,
  callback,
}: {
  eventBus: IWorkerEventBus<TSubscribeData, TCallbackData>,
  data: WorkerData<TSubscribeData>,
  abortSignal?: IAbortSignalFast,
  callback: WorkerCallback<TCallbackData>,
}): Promise<IUnsubscribeAsync> {
  const requestId = getNextId()

  let isFirstCallback = true
  const unsubscribe = workerSubscribe({
    eventBus,
    requestId,
    callback(_data, error) {
      if (isFirstCallback) {
        isFirstCallback = false
        return
      }
      callback(_data, error)
    },
  })

  try {
    type TUnsubscribeData = any
    
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    const unsubscribeData = await workerRequest<TSubscribeData, TUnsubscribeData>({
      eventBus,
      data,
      abortSignal,
      requestId,
    })

    return async function unsubscribeAsync(_abortSignal?: IAbortSignalFast) {
      unsubscribe()
      await workerRequest<TUnsubscribeData, void>({
        eventBus   : eventBus as any,
        data       : unsubscribeData,
        abortSignal: _abortSignal,
        requestId,
      })
    }
  }
  catch (err) {
    unsubscribe()
    throw err
  }
}
