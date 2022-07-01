import { IWorkerEventBus } from "../worker-server";
import { IWorkerClient } from './contracts';
export declare abstract class WorkerClient<TOptions> implements IWorkerClient {
    protected readonly _workerFilePath: string;
    options: TOptions;
    private _worker;
    private _workerEventBus;
    protected constructor({ workerFilePath, preInit, options, }: {
        workerFilePath: string;
        preInit: boolean;
        options: TOptions;
    });
    private _initPromise;
    init(): Promise<void>;
    private __init;
    protected abstract _init(workerEventBus: IWorkerEventBus): Promise<void> | void;
    terminate(): Promise<void>;
    protected abstract _terminate(): Promise<void> | void;
}
