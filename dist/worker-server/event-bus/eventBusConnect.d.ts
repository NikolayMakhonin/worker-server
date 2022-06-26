import { IUnsubscribe, IWorkerEventBus, WorkerData } from '../common/contracts';
export declare function eventBusConnect<TRequestData = any, TResponseData = any>({ server, client, requestFilter, }: {
    server: IWorkerEventBus<TRequestData, TResponseData>;
    client: IWorkerEventBus<TResponseData, TRequestData>;
    requestFilter: (event: WorkerData<TRequestData>) => boolean;
}): IUnsubscribe;
