import {IObjectPool, IPool, ObjectPool} from '@flemist/time-limits'
import {IWorkerClient} from './contracts'

interface IWorkerClientPool<TClient extends IWorkerClient>
extends IObjectPool<TClient> {
  terminate(): Promise<void>
}

export class WorkerClientPool<TClient extends IWorkerClient>
  extends ObjectPool<TClient>
  implements IWorkerClientPool<TClient> {

  protected constructor({
    createClient,
    threadsPool,
  }: {
    createClient: () => Promise<TClient> | TClient,
    threadsPool: IPool,
  }) {
    super({
      pool       : threadsPool,
      holdObjects: true,
      create     : createClient,
      destroy    : (client) => {
        return client.terminate()
      },
    })
  }

  async terminate(): Promise<void> {
    const promises: Promise<void>[] = []
    this.availableObjects.forEach(o => {
      promises.push(Promise.resolve().then(() => o.terminate()))
    })
    this.holdObjects.forEach(o => {
      promises.push(Promise.resolve().then(() => o.terminate()))
    })
    await Promise.all(promises)
  }
}
