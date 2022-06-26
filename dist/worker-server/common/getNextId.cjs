'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var worker_threads = require('worker_threads');

const idPrefix = process.pid + '_' + worker_threads.threadId + '_';
let nextId = 1;
function getNextId() {
    return idPrefix + nextId++;
}

exports.getNextId = getNextId;
