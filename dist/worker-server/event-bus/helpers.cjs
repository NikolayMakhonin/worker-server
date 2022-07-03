'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createListener(listeners) {
    return function listener(arg) {
        listeners.forEach(_listener => {
            try {
                _listener(arg);
            }
            catch (err) {
                console.error(err);
            }
        });
    };
}

exports.createListener = createListener;
