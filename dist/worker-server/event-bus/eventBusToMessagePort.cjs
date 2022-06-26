'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var worker_threads = require('worker_threads');
var workerServer_eventBus_messagePortToEventBus = require('./messagePortToEventBus.cjs');
var workerServer_eventBus_eventBusConnect = require('./eventBusConnect.cjs');
require('../errors/CloseError.cjs');
require('../common/getNextId.cjs');
require('../common/route.cjs');

function eventBusToMessagePort({ server, requestFilter, }) {
    const channel = new worker_threads.MessageChannel();
    const client = workerServer_eventBus_messagePortToEventBus.messagePortToEventBus(channel.port1);
    workerServer_eventBus_eventBusConnect.eventBusConnect({
        server,
        client,
        requestFilter,
    });
    return channel.port2;
}

exports.eventBusToMessagePort = eventBusToMessagePort;
