'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var workerServer_common_getNextId = require('../common/getNextId.cjs');
var workerServer_common_route = require('../common/route.cjs');
require('worker_threads');

function eventBusConnect({ server, client, requestFilter, }) {
    const connectionId = workerServer_common_getNextId.getNextId();
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
                if (!workerServer_common_route.routePop(event.route, connectionId)) {
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
            workerServer_common_route.routePush(event.route, connectionId);
            server.emit(event);
        });
    }
    catch (err) {
        unsubscribe();
        throw err;
    }
    return unsubscribe;
}

exports.eventBusConnect = eventBusConnect;
