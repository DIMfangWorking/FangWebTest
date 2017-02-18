//var mongoose = require('mongoose');

var database = undefined;
var mqUtil;
function findResource(filter, callback)
{
    mqUtil.sendRequestByRPC("resource find", filter, config.gatewayAmqp.resourceQueue);
    var selector = {};

    if (filter.major_id)
    {
        selector.major_id = parseInt(filter.major_id);
    }

    if (filter.ip)
    {
        selector.ip = filter.ip;
    }

    database.Resource.find(selector).sort({major_id:1}).exec(callback);
}

function updateResource(data, callback)
{
    mqUtil.sendRequestByRPC("resource update", data, config.gatewayAmqp.resourceQueue);
    database.Resource.update({major_id : data.major_id}, {$set : data}).exec(callback);
}

module.exports = function (db, mqutil) {
    database = db;
    mqUtil = mqutil;
    return {
        'findResource' : findResource,
        'updateResource' : updateResource
    };
}