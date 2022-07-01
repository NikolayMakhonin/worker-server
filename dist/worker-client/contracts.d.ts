export interface IWorkerClient {
    init(): Promise<void> | void;
    terminate(): Promise<void> | void;
}
