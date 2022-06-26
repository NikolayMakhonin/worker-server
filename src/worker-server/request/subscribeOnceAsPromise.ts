import {Callback, IUnsubscribe} from '../common/contracts'
import {AbortError, IAbortSignalFast} from '@flemist/abort-controller-fast'

export function subscribeOnceAsPromise<TData = any, TError = Error>({
  subscribe,
  abortSignal,
}: {
  subscribe: (callback: Callback<TData, TError>) => IUnsubscribe,
  abortSignal?: IAbortSignalFast,
}): Promise<TData> {
  return new Promise<TData>((_resolve, _reject) => {
    if (abortSignal?.aborted) {
      throw new AbortError()
    }

    let unsubscribeEventBus: IUnsubscribe

    const unsubscribeAbortSignal = abortSignal?.subscribe(unsubscribe)

    function unsubscribe() {
      if (unsubscribeAbortSignal) {
        unsubscribeAbortSignal()
      }
      if (unsubscribeEventBus) {
        unsubscribeEventBus()
      }
    }

    function resolve(data: TData) {
      unsubscribe()
      _resolve(data)
    }

    function reject(err: TError) {
      unsubscribe()
      _reject(err)
    }

    try {
      unsubscribeEventBus = subscribe((data, error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(data)
      })
    } catch (err) {
      unsubscribe()
      throw err
    }

    if (abortSignal?.aborted) {
      unsubscribe()
      throw new AbortError()
    }
  })
}
