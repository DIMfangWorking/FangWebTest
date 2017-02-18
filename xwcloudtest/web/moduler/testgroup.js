//var mongoose = require('mongoose');

var database = undefined;
var testgroupCurrentIndex = undefined;

function create(data, callback)
{
    data.id = testgroupCurrentIndex ++;

    var testgroup = new database.TestGroup(data);
    testgroup.save(function (err){
        if (err)
        {
            logger.info("save test group error. ", err);
        }
        else
        {
            logger.info("save test group success. ");
        }

        callback(err, testgroup);
    });
}

function remove(data, callback)
{
    database.TestGroup.remove({id : data.id},function (err){
        if (err)
        {
            logger.info("remove test group error. ", err);
        }
        else
        {
            logger.info("remove test group success. ");
        }

        callback(err);
    });
}

function update(data, callback)
{
    data.update = new Date();
    database.TestGroup.findOneAndUpdate({id : data.id},{$set : data}, function (err){
        logger.info('update test group arguments ', arguments);
        if (err)
        {
            logger.info("update test group error. ", err);
        }
        else
        {
            logger.info("update test group success. ");
        }

        callback(err);
    });
}

function get(task, callback)
{
    database.TestGroup.findOne({id : task.id}).select({"testcase.argv":-1}).exec(callback);
}

function find(filter, callback)
{
    var selector = {};
    if (filter.user)
    {
        logger.info('filter user : ', filter.user);
        selector.user = filter.user;
    }

    if (filter.type)
    {
        switch(filter.type)
        {
            case 'real':
                selector.type = {$in : ['real', 'both']};
                break;
            case 'simulation':
                selector.type = {$in : ['simulation', 'both']};
                break;
            case 'both':
                selector.type = 'both';
                break;
            default:
                callback('not support type' + selector.type, null);
                return;
                break;
        }
    }

    logger.info('selector : ', selector);

    query = database.TestGroup.find(selector).select({"testcase.argv": 0})

    if (filter.count)
    {
        query = query.limit(filter.count);
    }

    query.sort({id:1}).exec(callback);
}

module.exports = function (db) {
    database = db;
    database.TestGroup.find({})
                     .select({id:1})
                     .sort({id:-1})
                     .limit(1)
                     .exec(function(err, list) {
                         if (list.length == 0 || (list[0].id == undefined))
                         {
                             testgroupCurrentIndex = 1;
                         }
                         else
                         {
                            testgroupCurrentIndex = list[0].id + 1;
                         }
                         logger.info('test group index = ', testgroupCurrentIndex);
                      });
    return {
        'createTestGroup' : create
       ,'deleteTestGroup' : remove
       ,'updateTestGroup' : update
       ,'findTestGroup' : find
       ,'getTestGroup' : get
    };
}
