'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var worker_threads = require('worker_threads');
var workerServer_eventBus_workerToEventBus = require('../worker-server/event-bus/workerToEventBus.cjs');
require('../worker-server/common/getNextId.cjs');
require('@flemist/abort-controller-fast');
require('@flemist/async-utils');
var path = require('path');
require('../worker-server/errors/ExitError.cjs');
require('../worker-server/common/route.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

class WorkerClient {
    constructor({ workerFilePath, preInit, options, }) {
        this._worker = null;
        this._workerEventBus = null;
        this._workerFilePath = workerFilePath;
        this.options = options;
        if (preInit) {
            void this.init();
        }
    }
    init() {
        if (!this._initPromise) {
            this._initPromise = Promise.resolve().then(() => this.__init());
        }
        return this._initPromise;
    }
    __init() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this._worker = new worker_threads.Worker(path__default["default"].resolve(this._workerFilePath));
            this._workerEventBus = workerServer_eventBus_workerToEventBus.workerToEventBus(this._worker);
            yield this._init(this._workerEventBus);
        });
    }
    terminate() {
        var _a;
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this._worker) {
                yield ((_a = this._worker) === null || _a === void 0 ? void 0 : _a.terminate());
                this._worker = null;
                this._workerEventBus = null;
                this._initPromise = null;
                yield this._terminate();
            }
        });
    }
}

exports.WorkerClient = WorkerClient;
