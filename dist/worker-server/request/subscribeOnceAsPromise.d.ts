import { Callback, IUnsubscribe } from '../common/contracts';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare function subscribeOnceAsPromise<TData = any, TError = Error>({ subscribe, abortSignal, }: {
    subscribe: (callback: Callback<TData, TError>) => IUnsubscribe;
    abortSignal?: IAbortSignalFast;
}): Promise<TData>;
