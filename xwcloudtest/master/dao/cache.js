var util = require('util');

var Redis = require('ioredis');

var redis = new Redis({port:config.cache.port, host:config.cache.ip});
var redisEI = new Redis({port:config.cache.port, host:config.cache.ip, db:2});

// redis.monitor(function (err, monitor) {
//   // Entering monitoring mode.
//   logger.info('redis monitor err ' + err + ' monitor ' + monitor);
//   monitor.on('monitor', function (time, args) {
//     console.log(time + ": " + util.inspect(args));
//   });
// });

function getCacheLog(data, reslove, reject)
{
    logger.info("run get Cache Log start ");

    redis.lrange(data.task.cache_key, 0, -1, function (err, result){
            if (err || !result)
            {
                data.error = err;
                reject(data);
            }
            else
            {
                data.task.logs = [];

                var atomPatt = new RegExp('^run Atom\w+ result : False\n$','g');
                var patt = new RegExp('^group ' + data.task.test_group + ' run result: (False|True)\n$', 'g');
                var patt2 = new RegExp(' (False|True)\n$', 'g');

                for (var index in result)
                {
                    var message = JSON.parse(result[index]).message;

                    data.task.logs.push(message);

                    var atomFailMessage = message.match(atomPatt);
                    if (atomFailMessage && atomFailMessage.length > 0)
                    {
                        data.task.fail_message = message;
                    }
                    else
                    {
                        var matchResult = message.match(patt);
                        if (matchResult && matchResult.length > 0)
                        {
                            if ( message.match(patt2)[0] === ' False\n')
                            {
                                data.task.result = 'fail';
                            }
                            else
                            {
                                data.task.result = 'success';
                            }
                        }
                    }
                }

                reslove(data);
            }
    });
}

function delCacheLog(data, reslove, reject)
{
    logger.info("run del Cache Log start ");

    redis.del(data.task.cache_key, function (err){
        if (err)
        {
            data.error = err;
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function delStepLog(data, reslove, reject)
{
    logger.info("run del step Log start ");

    redis.del(data.task.cache_key + '.step', function (err){
        if (err)
        {
            data.error = err;
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function getEiBasicLog(data, reslove, reject)
{
    logger.info("run get ei basic Log start ");

    redisEI.lrange(data.task.cache_key, 0, -1, function (err, result){
            if (err || !result)
            {
                data.error = err;
                reject(data);
            }
            else
            {
                data.task.ei_basic = [];

                for (var index in result)
                {
                    var message = JSON.parse(result[index]);

                    data.task.ei_basic.push(message);
                }

                logger.info("get ei basic Log count :", data.task.ei_basic.length);

                reslove(data);
            }
    });
}

function delEiBasicLog(data, reslove, reject)
{
    logger.info("run del ei basic Log start ");

    redisEI.del(data.task.cache_key, function (err){
        if (err)
        {
            data.error = err;
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function checkCITaskCache()
{
    logger.info("check CI Task Cache start");

    redis.pipeline().lpop('ci_task_cache').exec(function (err, result){
        if (err)
        {
            logger.info("check CI Task Cache err", err);
        }
        else if (result[0] && result[0][0])
        {
            rerunAutoTask(JSON.parse(result[0][0]));
        }
    });
}

function cacheCITask(data, reslove, reject)
{
    logger.info("cache CI task");

    if (data.original_id)
    {
        data.task.original_id = data.original_id;
    }

    redis.pipeline().rpush('ci_task_cache', JSON.stringify(data.task)).exec(function(err, result){
        if (err) logger.error(err);
        reject(data);
    });
}

module.exports = function (db) {
    database = db;

    return {
        'getCacheLog' : getCacheLog,
        'delCacheLog' : delCacheLog,
        'delStepLog' : delStepLog,
        'getEiBasicLog' : getEiBasicLog,
        'delEiBasicLog' : delEiBasicLog,
        'cacheCITask' : cacheCITask,
        'checkCITaskCache' : checkCITaskCache,
    };
}