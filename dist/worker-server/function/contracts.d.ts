export declare type FunctionRequest<TRequestData = any> = {
    func: string;
    data: TRequestData;
};
export declare type SubscribeAction = 'call' | 'abort' | 'unsubscribe';
export declare type SubscribeRequest<TRequestData = any> = {
    requestId: string;
} & ({
    data: TRequestData;
    type: 'call';
} | {
    data: void;
    type: 'abort' | 'abortUnsubscribe' | 'unsubscribe';
});
export declare type AbortFunc = (reason: any) => void;
