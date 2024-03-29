import {IObjectPool, IPool, ObjectPool} from '@flemist/time-limits'
import {IWorkerClient} from './contracts'

interface IWorkerClientPool<TClient extends IWorkerClient>
extends IObjectPool<TClient>, IWorkerClient {
  terminate(): Promise<void>
}

export class WorkerClientPool<TClient extends IWorkerClient>
  extends ObjectPool<TClient>
  implements IWorkerClientPool<TClient> {

  protected constructor({
    createClient,
    threadsPool,
    preInit,
  }: {
    createClient: () => Promise<TClient> | TClient,
    threadsPool: IPool,
    preInit: boolean,
  }) {
    super({
      pool       : threadsPool,
      holdObjects: true,
      create     : createClient,
      destroy    : (client) => {
        return client.terminate()
      },
    })

    if (preInit) {
      void this.allocate()
    }
  }

  init(): Promise<void> | void {
    return this.allocate() as any
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
