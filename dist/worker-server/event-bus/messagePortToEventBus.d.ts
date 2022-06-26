/// <reference types="node" />
import { MessagePort } from 'worker_threads';
import { IWorkerEventBus } from '../common/contracts';
export declare function messagePortToEventBus<TData = any>(messagePort: MessagePort): IWorkerEventBus<TData>;
