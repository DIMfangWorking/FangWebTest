/**
 *
 * A factory that can create different dispatcher
 */
var dispatcherToSlaves = require('./dispatcherToSlaves.js');

exports.createDispatcher = function(whichDispatcher) {
    switch (whichDispatcher) {
        case 'slave' : return new dispatcherToSlaves();
        break;
    }
}