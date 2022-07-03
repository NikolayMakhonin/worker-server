import {Worker} from 'worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from '../common/contracts'
import {ExitError} from '../errors/ExitError'
import {ALL_CONNECTIONS} from 'src/worker-server/common/route'
import {createListener} from 'src/worker-server/event-bus/helpers'

export function workerToEventBus<TRequestData = any, TResponseData = any>(
  worker: Worker,
): IWorkerEventBus<TRequestData, TResponseData> {
  const listeners = {
    error       : new Set<(error: Error) => void>(),
    messageerror: new Set<(error: Error) => void>(),
    exit        : new Set<(code: number) => void>(),
    message     : new Set<(event: WorkerEvent<TResponseData>) => void>(),
  }

  // optimization: you should have native subscriptions as few as possible, because it works very slowly
  worker.on('error', createListener(listeners.error))
  worker.on('messageerror', createListener(listeners.messageerror))
  worker.on('exit', createListener(listeners.exit))
  worker.on('message', createListener(listeners.message))

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
      function onMessage(event: WorkerEvent<TResponseData>) {
        callback(event)
      }

      function unsubscribe() {
        listeners.error.delete(onError)
        listeners.messageerror.delete(onMessageError)
        listeners.exit.delete(onExit)
        listeners.message.delete(onMessage)
      }

      listeners.error.add(onError)
      listeners.messageerror.add(onMessageError)
      listeners.exit.add(onExit)
      listeners.message.add(onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TRequestData>) {
      worker.postMessage(event, event.data?.transferList?.filter(o => !(o instanceof SharedArrayBuffer)))
    },
  }
}
