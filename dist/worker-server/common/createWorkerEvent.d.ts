import { WorkerData, WorkerEvent } from './contracts';
export declare function createWorkerEvent<TData = any>(data: WorkerData<TData>, error: Error, route: string[]): WorkerEvent<TData>;
