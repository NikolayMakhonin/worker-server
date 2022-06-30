import {Worker} from 'worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from '../common/contracts'
import {ExitError} from '../errors/ExitError'
import {ALL_CONNECTIONS} from "src/worker-server/common/route";

export function workerToEventBus<TRequestData = any, TResponseData = any>(
  worker: Worker,
): IWorkerEventBus<TRequestData, TResponseData> {
  return {
    subscribe(callback: (event: WorkerEvent<TResponseData>) => void): IUnsubscribe {
      function onError(error: Error) {
        console.error(error)
      }
      function onMessageError(error: Error) {
        console.error(error)
        callback({error: error, route: [ALL_CONNECTIONS]})
      }
      function onExit(code: number) {
        if (code) {
          console.error(new ExitError(code))
        }
        else {
          console.warn(`Exit code: ${code}`)
        }
        callback({error: new ExitError(code), route: [ALL_CONNECTIONS]})
      }
      function onMessage(event) {
        callback(event)
      }

      function unsubscribe() {
        worker.off('error', onError)
        worker.off('messageerror', onMessageError)
        worker.off('exit', onExit)
        worker.off('message', onMessage)
      }

      worker.setMaxListeners(100000)
      worker.on('error', onError)
      worker.on('messageerror', onMessageError)
      worker.on('exit', onExit)
      worker.on('message', onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TRequestData>) {
      worker.postMessage(event, event.data?.transferList)
    },
  }
}
