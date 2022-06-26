import { routePop } from '../common/route.mjs';

function workerSubscribe({ eventBus, requestId, callback, }) {
    let unsubscribeEventBus;
    function unsubscribe() {
        if (unsubscribeEventBus) {
            unsubscribeEventBus();
        }
    }
    try {
        unsubscribeEventBus = eventBus.subscribe(({ data, error, route, }) => {
            try {
                if (!routePop(route, requestId)) {
                    return;
                }
            }
            catch (err) {
                callback(void 0, err);
            }
            if (route.length) {
                callback(void 0, new Error(`route.length == ${route.length}`));
            }
            if (error) {
                callback(void 0, error);
                return;
            }
            callback(data);
        });
    }
    catch (err) {
        unsubscribe();
        throw err;
    }
    return unsubscribe;
}

export { workerSubscribe };
