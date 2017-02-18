/* status machine */
var os = require('os');
var util = require('util');

global.getPlatformLib = require('./platform');

var moduleArray = autoLoadModule(pwd + "/slave/common/" + global.getPlatformLib());

var exportFunction = {}

moduleArray.forEach(function(item) {
    var loadObj = undefined;
    if (util.isFunction(item))
    {
        loadObj = item();
    }
    else
    {
        loadObj = item;
    }

    for (var key in loadObj)
    {
        exportFunction[key] = loadObj[key];
    }
});

module.exports = exportFunction;