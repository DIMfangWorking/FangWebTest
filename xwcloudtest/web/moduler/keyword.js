//var mongoose = require('mongoose');

var database = undefined;

function findKeyWord(filter, callback)
{
    var selector = {};

    if (filter.user)
    {
        logger.info('filter user : ', filter.user);
        selector.user = filter.user;
    }

    if (filter.name)
    {
        logger.info('filter name : ', filter.name);
        selector.name = filter.name;
    }

    var query = database.KeyWord.find(selector).sort({id:1});

    if (filter.count)
    {
        query = query.limit(filter.count)
    }

    query.exec(callback);
}

module.exports = function (db) {
    database = db;
    return {
        'findKeyWord' : findKeyWord
    };
}
