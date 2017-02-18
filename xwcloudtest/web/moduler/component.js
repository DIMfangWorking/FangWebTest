//var mongoose = require('mongoose');

var database = undefined;
var componentCurrentIndex = 0;

function createComponent(data, callback)
{
    data.id = componentCurrentIndex++;

    var component = new database.Component(data);
    component.save(function (err){
        if (err)
        {
            logger.info("save component error. ", err);
        }
        else
        {
            logger.info("save component success. ");
        }

        callback(err, component);
    });
}

function deleteComponent(data, callback)
{
    database.Component.remove({id : data.id},function (err){
        if (err)
        {
            logger.info("remove component error. ", err);
        }
        else
        {
            logger.info("remove component success. ");
        }

        callback(err);
    });
}

function updateComponent(data, callback)
{
    data.update = new Date();
    database.Component.findOneAndUpdate({id : data.id},{$set : data}, function (err){
        logger.info('updateComponent arguments ', arguments);
        if (err)
        {
            logger.info("update component error. ", err);
        }
        else
        {
            logger.info("update component success. ");
        }

        callback(err);
    });
}

function getComponent(data, callback)
{
    database.Component.findOne({id : data.id}).select({argv:0}).exec(callback);
}

function findComponent(filter, callback)
{
    var selector = {};
    if (filter.user)
    {
        logger.info('filter user : ', filter.user);
        selector.user = filter.user;
    }

    database.Component.find(selector).sort({id:1}).select({argv:0}).exec(callback);
}

module.exports = function (db) {
    database = db;
    db.Component.find({})
                .select({id:1})
                .sort({id:-1})
                .limit(1)
                .exec(function (err, list) { 
                    logger.debug('component init : ', list)
                    if (list.length == 0 || (list[0].id == undefined))
                    {
                        componentCurrentIndex = 1;
                    }
                    else
                    {
                        componentCurrentIndex = list[0].id + 1;
                    }
                    logger.info('component index = ', componentCurrentIndex);
                });
    return {
        'createComponent' : createComponent
      , 'deleteComponent' : deleteComponent
      , 'updateComponent' : updateComponent
      , 'getComponent' : getComponent
      , 'findComponent' : findComponent
    };
}
