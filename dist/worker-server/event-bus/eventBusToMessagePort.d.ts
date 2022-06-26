/// <reference types="node" />
import { MessagePort } from 'worker_threads';
import { IWorkerEventBus, WorkerData } from '../common/contracts';
export declare function eventBusToMessagePort<TRequestData = any>({ server, requestFilter, }: {
    server: IWorkerEventBus<TRequestData>;
    requestFilter: (data: WorkerData<TRequestData>) => boolean;
}): MessagePort;
