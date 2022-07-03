import {workerFunctionClient} from '../function/workerFunctionServer'
import {Worker} from 'worker_threads'
import path from 'path'
import {workerToEventBus} from '../event-bus/workerToEventBus'
import {eventBusToMessagePort} from '../event-bus/eventBusToMessagePort'
import {DEBUG, TestFuncArgs} from './contracts'

const worker1 = new Worker(path.resolve('./dist/worker-server/test/worker1.cjs'))
const worker1EventBus = workerToEventBus(worker1)

export const func1 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: worker1EventBus,
  name    : 'func1',
  debug   : DEBUG,
})

let func1Port = eventBusToMessagePort({
  server: worker1EventBus,
  requestFilter(data) {
    return data?.data?.task === 'func1'
  },
})
const workerTransit = new Worker(
  path.resolve('./dist/worker-server/test/worker-transit.cjs'),
  {
    workerData: {
      func1Port,
    },
    transferList: [func1Port],
  },
)

const workerTransitEventBus = workerToEventBus(workerTransit)

export const func2 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: workerTransitEventBus,
  name    : 'func2',
  debug   : DEBUG,
})

export const func3 = workerFunctionClient<TestFuncArgs, Float32Array>({
  eventBus: workerTransitEventBus,
  name    : 'func3',
  debug   : DEBUG,
})

export function terminateWorkers() {
  return Promise.all([
    worker1.terminate(),
    workerTransit.terminate(),
  ])
}
