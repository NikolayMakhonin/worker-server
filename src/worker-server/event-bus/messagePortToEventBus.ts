import {MessagePort} from 'worker_threads'
import {IUnsubscribe, IWorkerEventBus, WorkerEvent} from '../common/contracts'
import {CloseError} from '../errors/CloseError'
import {createListener} from 'src/worker-server/event-bus/helpers'

export function messagePortToEventBus<TData = any>(messagePort: MessagePort): IWorkerEventBus<TData> {
  const listeners = {
    messageerror: new Set<(error: Error) => void>(),
    close       : new Set<() => void>(),
    message     : new Set<(event: WorkerEvent<TData>) => void>(),
  }

  // optimization: you should have native subscriptions as few as possible, because it works very slowly
  messagePort.on('messageerror', createListener(listeners.messageerror))
  messagePort.on('close', createListener(listeners.close))
  messagePort.on('message', createListener(listeners.message))

  return {
    subscribe(callback: (event: WorkerEvent<TData>) => void): IUnsubscribe {
      // function onError(error: Error) {
      //   console.error(error)
      // }
      function onMessageError(error: Error) {
        console.error(error)
      }
      function onClose() {
        console.error(new CloseError())
      }
      function onMessage(event) {
        callback(event)
      }

      function unsubscribe() {
        listeners.messageerror.delete(onMessageError)
        listeners.close.delete(onClose)
        listeners.message.delete(onMessage)
      }

      listeners.messageerror.add(onMessageError)
      listeners.close.add(onClose)
      listeners.message.add(onMessage)

      return unsubscribe
    },
    emit(event: WorkerEvent<TData>) {
      messagePort.postMessage(event, event.data?.transferList?.filter(o => !(o instanceof SharedArrayBuffer)))
    },
  }
}
