import { getNextId } from '../common/getNextId.mjs';
import { routePop, routePush } from '../common/route.mjs';
import 'worker_threads';

function eventBusConnect({ server, client, requestFilter, }) {
    const connectionId = getNextId();
    let unsubscribeServer;
    let unsubscribeClient;
    function unsubscribe() {
        if (unsubscribeServer) {
            unsubscribeServer();
        }
        if (unsubscribeClient) {
            unsubscribeClient();
        }
    }
    try {
        unsubscribeServer = server.subscribe((event) => {
            try {
                if (!routePop(event.route, connectionId)) {
                    return;
                }
                client.emit(event);
            }
            catch (err) {
                console.error(err);
                return;
            }
        });
        unsubscribeClient = client.subscribe((event) => {
            if (!requestFilter(event.data)) {
                return;
            }
            routePush(event.route, connectionId);
            server.emit(event);
        });
    }
    catch (err) {
        unsubscribe();
        throw err;
    }
    return unsubscribe;
}

export { eventBusConnect };
