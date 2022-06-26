/// <reference types="node" />
import { Worker } from 'worker_threads';
import { IWorkerEventBus } from '../common/contracts';
export declare function workerToEventBus<TRequestData = any, TResponseData = any>(worker: Worker): IWorkerEventBus<TRequestData, TResponseData>;
