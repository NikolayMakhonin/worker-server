import {parentPort} from 'worker_threads'
import {workerFunctionServer, WorkerFunctionServerResult} from '../function/workerFunctionServer'
import {messagePortToEventBus} from '../event-bus/messagePortToEventBus'
import {WorkerData} from '../common/contracts'
import {TestFuncArgs} from './contracts'
import {createTestFuncResult} from './helpers'
import {delay} from '@flemist/async-utils'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

function func1(
  data: WorkerData<TestFuncArgs>,
  abortSignal: IAbortSignalFast,
  callback: (data: WorkerData) => void,
): WorkerFunctionServerResult<Float32Array> {
  callback(createTestFuncResult(data.data.value.slice()))
  data.data.value[0]++
  callback(createTestFuncResult(data.data.value.slice()))
  if (data.data.error) {
    throw new Error('func1')
  }
  if (data.data.async) {
    return (async () => {
      await delay(20000)
      if (abortSignal.aborted) {
        // throw new Error('abort')
        const reason = (abortSignal as any).reason
        if (reason) {
          throw reason
        }
        return void 0
      }
      data.data.value[0]++
      const result = createTestFuncResult(data.data.value)
      return result
    })()
  }

  data.data.value[0]++
  const result = createTestFuncResult(data.data.value)
  return result
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : func1,
})
