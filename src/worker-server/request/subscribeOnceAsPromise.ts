import {Callback, IUnsubscribe} from '../common/contracts'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'
import {rejectAsResolve} from "@flemist/async-utils";

export function subscribeOnceAsPromise<TData = any, TError = Error>({
  subscribe,
  abortSignal,
}: {
  subscribe: (callback: Callback<TData, TError>) => IUnsubscribe,
  abortSignal?: IAbortSignalFast,
}): Promise<TData> {
  return new Promise<TData>((_resolve) => {
    if (abortSignal?.aborted) {
      throw abortSignal.reason
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
      rejectAsResolve(_resolve, err)
    }

    try {
      unsubscribeEventBus = subscribe((data, error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(data)
      })
    }
    catch (err) {
      unsubscribe()
      throw err
    }

    if (abortSignal?.aborted) {
      unsubscribe()
      throw abortSignal.reason
    }
  })
}
