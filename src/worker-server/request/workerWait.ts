import {IWorkerEventSubscriber, WorkerData} from '../common/contracts'
import {workerSubscribe} from './workerSubscribe'
import {subscribeOnceAsPromise} from './subscribeOnceAsPromise'
import {IAbortSignalFast} from "@flemist/abort-controller-fast";

export function workerWait<TResponseData = any>({
  eventBus,
  requestId,
  abortSignal,
}: {
  eventBus: IWorkerEventSubscriber<TResponseData>,
  requestId: string,
  abortSignal?: IAbortSignalFast,
}): Promise<WorkerData<TResponseData>> {
  return subscribeOnceAsPromise<WorkerData<TResponseData>>({
    subscribe(callback) {
      return workerSubscribe({
        eventBus,
        requestId,
        callback,
      })
    },
    abortSignal,
  })
}
