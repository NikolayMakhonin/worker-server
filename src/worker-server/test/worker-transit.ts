import {parentPort, Worker, workerData} from 'worker_threads'
import {
  messagePortToEventBus,
  workerToEventBus,
  eventBusConnect,
  eventBusToMessagePort,
  TaskFunctionRequest,
} from 'src'
import path from 'path'

const func1Port = workerData.func1Port
const func1EventBus = messagePortToEventBus<TaskFunctionRequest>(func1Port)

let func1PortForward = eventBusToMessagePort({
  server: func1EventBus,
  requestFilter(data) {
    return data?.data?.task === 'func1'
  },
})
const worker2 = new Worker(
  path.resolve('./dist/worker-server/test/worker2.cjs'),
  {
    workerData  : {func1Port: func1PortForward},
    transferList: [func1PortForward],
  },
)
const worker2EventBus = workerToEventBus(worker2)

func1PortForward = eventBusToMessagePort({
  server: func1EventBus,
  requestFilter(data) {
    return data?.data?.task === 'func1'
  },
})
const worker3 = new Worker(
  path.resolve('./dist/worker-server/test/worker3.cjs'),
  {
    workerData  : {func1Port: func1PortForward},
    transferList: [func1PortForward],
  },
)
const worker3EventBus = workerToEventBus(worker3)

const parentEventBus = messagePortToEventBus(parentPort)
eventBusConnect({
  server: worker3EventBus,
  client: parentEventBus,
  requestFilter(data) {
    return data?.data?.task === 'func3'
  },
})
eventBusConnect({
  server: worker2EventBus,
  client: parentEventBus,
  requestFilter(data) {
    return data?.data?.task === 'func2'
  },
})
