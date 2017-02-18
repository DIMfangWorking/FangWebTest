//var mongoose = require('mongoose');

var database = undefined;
var testcaseCurrentIndex = undefined;

function create(data, callback)
{
    data.sequenceOfOpera.forEach(function (item){
        switch(item.name){
            case'SetDataBase':
            case 'ConfigEnb':
                item.argv.forEach(function(item){
                    if (item.name != 'Option'){
                        return;
                    }

                    try{
                        var option = new DBSetOptionParse(item.value);

                        option.check();

                        JSON.stringify(option);
                    }catch(e){
                        callback('db option error. ' + e.message, undefined);
                        throw e;
                    }
                });
                break;
            default:
               break;
        }
    });

    data.id = testcaseCurrentIndex ++;

    var testcase = new database.TestCase(data);
    testcase.save(function (err){
        if (err)
        {
            logger.info("save test case error. ", err);
        }
        else
        {
            logger.info("save test case success. ");
        }

        callback(err, testcase);
    });
}

function remove(data, callback)
{
    data.update = new Date();
    database.TestCase.remove({id : data.id},function (err){
        if (err)
        {
            logger.info("remove test case error. ", err);
        }
        else
        {
            logger.info("remove test case success. ");
        }

        callback(err);
    });
}

function update(data, callback)
{
    data.update = new Date();
    database.TestCase.findOneAndUpdate({id : data.id},{$set : data}, function (err){
        if (err)
        {
            logger.info("update test case error. ", err);
        }
        else
        {
            logger.info("update test case success. ");
        }

        callback(err);
    });
}

function get(task, callback)
{
    database.TestCase.findOne({id : task.id}).exec(callback);
}

function find(filter, callback)
{
    var selector = {};
    if (filter.user)
    {
        logger.info('filter user : ', filter.user);
        selector.user = filter.user;
    }

    database.TestCase.find(selector).sort({id:1}).exec(callback);
}

module.exports = function (db) {
    database = db;
    database.TestCase.find({})
                     .select({id:1})
                     .sort({id:-1})
                     .limit(1)
                     .exec(function(err, list) {
                         if (list.length == 0 || (list[0].id == undefined))
                         {
                             testcaseCurrentIndex = 1;
                         }
                         else
                         {
                            testcaseCurrentIndex = list[0].id + 1;
                         }
                         logger.info('test case index = ', testcaseCurrentIndex);
                      });
    return {
        'createTestCase' : create
       ,'deleteTestCase' : remove
       ,'updateTestCase' : update
       ,'findTestCase' : find
       ,'getTestCase' : get
    };
}