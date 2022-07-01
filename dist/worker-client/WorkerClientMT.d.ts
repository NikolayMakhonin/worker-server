import { IWorkerClient } from './contracts';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare class WorkerClientMT<TOptions, TClient extends IWorkerClient> implements IWorkerClient {
    options?: TOptions;
    private readonly _clientPool;
    private readonly _createClient;
    protected constructor({ createClient, threads, preInit, options, }: {
        createClient: (options: TOptions) => Promise<TClient> | TClient;
        threads: number;
        preInit: boolean;
        options: TOptions;
    });
    init(): Promise<void> | (TClient extends PromiseLike<any> ? Promise<void> : void);
    use<TResult>(func: (client: TClient, abortSignal?: IAbortSignalFast) => Promise<TResult> | TResult, abortSignal?: IAbortSignalFast): Promise<TResult>;
    terminate(): Promise<void>;
}
