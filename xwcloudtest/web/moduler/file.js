var fs = require('fs');
var util = require('util')

var database = undefined;

var fileMapping = {};

function saveFileMap(obj, callback)
{
    fileMapping[obj.file] = obj.original;
    callback(null, obj);
}

function deleteFileMap(obj, callback)
{
    delete fileMapping[obj];
    callback(null);
}

function getFileMap(obj, callback)
{
    callback(null, fileMapping[obj]);
}

module.exports = function (db) {
    database = db;

    return {
        'saveFileMap' : saveFileMap
      , 'deleteFileMap' : deleteFileMap
      , 'getFileMap' : getFileMap
    };
}