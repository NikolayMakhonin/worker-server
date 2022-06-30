import {parentPort, workerData} from 'worker_threads'
import {
  workerFunctionClient,
  workerFunctionServer,
  WorkerFunctionServerResult,
  messagePortToEventBus,
  WorkerData,
} from 'src'
import {TestFuncArgs} from './contracts'
import {createTestFuncResult} from './helpers'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus(func1Port)

const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: func1EventBus,
  name    : 'func1',
  debug   : true,
})

function func3(
  data: WorkerData<TestFuncArgs>,
  abortSignal: IAbortSignalFast,
  callback: (data: WorkerData) => void,
): WorkerFunctionServerResult<Float32Array> {
  callback(createTestFuncResult(data.data.value.slice()))
  data.data.value[2]++
  callback(createTestFuncResult(data.data.value.slice()))
  if (data.data.async) {
    return (async () => {
      const result = await func1(data, abortSignal, callback)
      if (result.data) {
        result.data[2]++
      }
      return result
    })()
  }
  if (data.data.error) {
    throw new Error('func3')
  }
  data.data.value[2]++
  return createTestFuncResult(data.data.value)
}

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : func3,
  debug   : true,
})
