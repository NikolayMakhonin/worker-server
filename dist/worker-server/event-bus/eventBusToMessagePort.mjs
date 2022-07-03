import { MessageChannel } from 'worker_threads';
import { messagePortToEventBus } from './messagePortToEventBus.mjs';
import { eventBusConnect } from './eventBusConnect.mjs';
import '../errors/CloseError.mjs';
import './helpers.mjs';
import '../common/getNextId.mjs';
import '../common/route.mjs';

function eventBusToMessagePort({ server, requestFilter, }) {
    const channel = new MessageChannel();
    const client = messagePortToEventBus(channel.port1);
    eventBusConnect({
        server,
        client,
        requestFilter,
    });
    return channel.port2;
}

export { eventBusToMessagePort };
