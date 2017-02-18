var fs = require('fs');
var util = require('util');
var url = require('url');
var Redis = require('ioredis');

var file_manager = require('./file');

var database = undefined;
var fileManager = undefined;

var key_value = {};
var stepInfo = {};

var redis_messageQ = new Redis({port:config.cache.port, host:config.cache.ip});
var redis = new Redis({port:config.cache.port, host:config.cache.ip});
var redisEi = new Redis({port:config.cache.port, host:config.cache.ip, db:2});

// redis.monitor(function (err, monitor) {
//   // Entering monitoring mode.
//   logger.info('redis monitor err ' + err + ' monitor ' + monitor);
//   monitor.on('monitor', function (time, args) {
//     console.log(time + ": " + util.inspect(args));
//   });
// });

redis_messageQ.subscribe('task_key', function (err, count) {
    logger.info('subscribe err ', err);
    logger.info('subscribe count ', count);
});

redis_messageQ.on('message', function (channel, message) {
    logger.info('channel : ' + channel + ' message : ' + message);
    var task_key = JSON.parse(message);
    for (var index in task_key)
    {
        key_value[index] = task_key[index];
    }
    logger.info('key_value : ', key_value);
});

function getTask(task, viewResponseFunc)
{
    database.TaskRecord.findOne({id : task.id}).sort({date:-1}).exec(function (err, data) {
        if (err || !data)
        {
            logger.info('get task fail .', err);
            viewResponseFunc('not found task',data);
        }
        else
        {
            var task_doc = data.toObject();
            var taskid = task_doc.id;
            var log_id = task.log_id || 0;
            logger.info("get task id : ", taskid);

            if (task_doc.status == 'run' && key_value[taskid])
            {
                logger.info("get task. get redis key : ", key_value[taskid]);

                task_doc.logs = [];

                redis.pipeline()
                        .llen(key_value[taskid])
                        .lrange(key_value[taskid], log_id, -1)
                        .hget(key_value[taskid] + '.step', 'testcase')
                        .hget(key_value[taskid] + '.step', 'testcase.total')
                        .hget(key_value[taskid] + '.step', 'testcase.current')
                        .hget(key_value[taskid] + '.step', 'atom')
                        .hget(key_value[taskid] + '.step', 'atom.total')
                        .hget(key_value[taskid] + '.step', 'atom.current').exec(function (err, result) {
                    logger.debug('redis lrange error : ', err);
                    logger.debug("result : ", result);
                    if (result)
                    {
                        task_doc.current_log_id = result[0][result[0].length - 1];

                        var logs = result[1][result[1].length - 1];

                        var testcaseStep = result[2][result[2].length - 1];
                        var testcaseTotal = result[3][result[3].length - 1];
                        var testcaseCurrent = result[4][result[4].length - 1];

                        var atomStep = result[5][result[5].length - 1];
                        var atomTotal = result[6][result[6].length - 1];
                        var atomCurrent = result[7][result[7].length - 1];

                        for (var index in logs)
                           task_doc.logs.push(JSON.parse(logs[index]).message);

                        task_doc.step = { 'AtomStep' : atomStep, 'TestCaseStep' : testcaseStep
                            , 'Current' : atomCurrent, 'Total' : atomTotal
                            , 'TestCaseCurrent': testcaseCurrent, 'TestCaseTotal' : testcaseTotal };

                        logger.debug('result ', result);
                    }
                    viewResponseFunc(err,task_doc);
                });
            }
            else
            {
                delete key_value[taskid];

                task_doc.current_log_id = task_doc.logs.length;

                if (log_id && log_id > 0)
                {
                    var logs = [];
                    for (var i = log_id ; task.length < 0; i ++)
                    {
                        logs.push(task_doc[i]);
                    }
                    task_doc.logs = logs;
                }

                viewResponseFunc(err,task_doc);
            }
        }
    });
    return ;
}

function parseFtpUrl(urlStr, callback)
{
    var urlObj = url.parse(urlStr);
    var user = null;
    var passwd = null;
    var path = null;
    var ftpArgv = null;

    if (urlObj.protocol !== 'ftp:')
    {
        logger.error('protocol not ftp. is ' + urlObj.protocol);
        callback('protocol not ftp. is ' + urlObj.protocol, null);
        return;
    }

    urlObj.port = (urlObj.port || 21);

    if (urlObj.auth)
    {
        var auth = urlObj.auth.split(":");
        if (auth.length == 2)
        {
            user = auth[0];
            passwd = auth[1];
        }
        else
        {
            logger.error('auth fail ' + auth);
            callback('auth fail ' + auth, null);
            return;
        }
    }

    ftpArgv = {host : urlObj.host,
               port : urlObj.port,
               user : user,
               password : passwd,
               path : urlObj.path
           };

    callback(null, ftpArgv);
}

function simEvnTestFileCheck(task, callback)
{
    if (task.measured_object.exe_file && task.measured_object.db_file)
    {
        var ftpArgv = {host :config.ftp.ip,
                       port : config.ftp.port,
                       user : config.ftp.user,
                       password : config.ftp.password,
                   };

        fileManager.getFileMap(task.measured_object.exe_file, function (err, original){
            ftpArgv.original_exe = original;
        });

        fileManager.deleteFileMap(task.measured_object.exe_file, function(err){});

        fileManager.getFileMap(task.measured_object.db_file, function (err, original){
            ftpArgv.original_db = original;
        });

        fileManager.deleteFileMap(task.measured_object.db_file, function(err){});

        callback(null, ftpArgv);
    }
    else if (task.measured_object.url)
    {
        parseFtpUrl(task.measured_object.url, function(err, obj){
            if (err || !obj)
            {
                callback(err, obj);
            }
            else
            {
                obj.original_exe = 'lte_app';
                obj.original_db = 'lte.db';
                callback(err, obj);
            }
        });
    }
    else if (!task.measured_object.exe_file && !task.measured_object.db_file)
    {
        callback(null, null);
    }
    else
    {
        var message = 'exe_file is ' + task.measured_object.exe_file + ' db_file is ' + task.measured_object.db_file + ' and ftp addr is none.';
        callback(message, null);
    }
}

function realEvnTestFileCheck(task, callback)
{
    if (task.measured_object.exe_file)
    {
        var ftpArgv = {host : config.ftp.ip,
                       port : config.ftp.port,
                       user : config.ftp.user,
                       password : config.ftp.password,
               };

        fileManager.getFileMap(task.measured_object.exe_file, function (err, original){
            if (err || !original)
            {
                callback('not found file \'' + task.measured_object.exe_file + '\'', null);
            }
            else
            {
                ftpArgv.original = original;
                callback(null, ftpArgv);
            }
        });

        fileManager.deleteFileMap(task.measured_object.exe_file, function(err){});
    }
    else if (task.measured_object.url)
    {
        parseFtpUrl(task.measured_object.url, function(err, obj){
            if (err || !obj)
            {
                callback(err, null);
            }
            else
            {
                var pathArray = task.measured_object.url.split('/')
                obj.original = pathArray[pathArray.length - 1];
                task.measured_object.exe_file = obj.path;
                callback(err, obj);
            }
        });
    }
}

function createTask (task,callback)
{
    if (MasterStore.status == STATUS_LOST)
    {
        callback("master is lost");
        return;
    }

    var resultFlag = true;

    var options = {
        port: MasterStore.port,
        hostname: MasterStore.ip,
        method: 'POST',
        path: '/master/task',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    logger.debug("options:",options);

    switch(task.type)
    {
        case 'real':
            realEvnTestFileCheck(task, function(err, obj){
                if (err)
                {
                    callback(err,obj);
                    resultFlag = false;
                }
                else
                {
                    task.measured_object.ftp = obj;
                }
            });
            break;
        case 'simulation':
            simEvnTestFileCheck(task, function(err, obj){
                if (err)
                {
                    callback(err,obj);
                    resultFlag = false;
                }
                else
                {
                    task.measured_object.ftp = obj;
                }
            });
            break;
        default:
            logger.error('task type error. ' + data.task.type);
            callback('task type error. ' + data.task.type, null);
            resultFlag = false;
            break;
    }

    if (resultFlag == false)
    {
        return ;
    }

    var postData = JSON.stringify(task);

    sendHttpRequest(options, postData, function (err, res, chunk) {
        var result = undefined;
        logger.info('master response. ', chunk);
        if (chunk)
        {
            result = JSON.parse(chunk);
        }
        callback(err, result);
    });

    return ; 
}

function createAutoTask(task, callback)
{
    if (MasterStore.status == STATUS_LOST)
    {
        callback("master is lost");
        return;
    }

    var resultFlag = true;

    var options = {
        port: MasterStore.port,
        hostname: MasterStore.ip,
        method: 'POST',
        path: '/master/CI/task',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    logger.debug("options:",options);

    switch(task.type)
    {
        case 'real':
            parseFtpUrl(task.bin_file, function(err, obj){
                if (err || !obj)
                {
                    callback(err, null);
                }
                else
                {
                    var pathArray = obj.path.split('/');
                    obj.original = pathArray[pathArray.length - 1];
                    task.measured_object = {url : task.bin_file
                        , ftp : obj
                        , exe_file : obj.path};
                }
            });
            break;
        case 'simulation':
            break;
        default:
            logger.error('task type error. ' + data.task.type);
            callback('task type error. ' + data.task.type, null);
            resultFlag = false;
            break;
    }

    if (resultFlag == false)
    {
        return ;
    }

    var postData = JSON.stringify(task);

    sendHttpRequest(options, postData, function (err, res, chunk) {
        var result = undefined;
        logger.info('master response. ', chunk);
        if (chunk)
        {
            result = JSON.parse(chunk);
        }
        callback(err, result);
    });

    return ; 
}

function getTaskPromise(data, reslove, reject)
{
    database.TaskRecord.findOne({id : data.task.id}).sort({date:-1}).exec(function (err, task) {
        if (err || !data)
        {
            logger.info('get task fail .', err);
            data.error = 'get task fail .' + err;
            reject(data);
        }
        else
        {
            data.task = task.toObject();
            reslove(data);
        }
    });
}

function processRerun(data, reslove, reject)
{
    switch(data.task.type)
    {
        case 'real':
            parseFtpUrl(data.task.bin_file, function(err, obj){
                if (err || !obj)
                {
                    data.error = 'parse ftp url error ' + err;
                    reject(data);
                }
                else
                {
                    var pathArray = obj.path.split('/');
                    obj.original = pathArray[pathArray.length - 1];
                    var task = { type : 'real'
                        , task_type : data.task.task_type
                        , env_type : data.task.env_type
                        , bin_file : data.task.bin_file
                        , measured_object : {url : data.task.bin_file
                            , ftp : obj
                            , exe_file : obj.path}
                        };
                    data.task = task;
                    reslove(data);
                }
            });
            break;
        case 'simulation':
            var task = { type : 'simulation'
                , task_type : data.task.task_type
                , env_type : data.task.env_type
                , revision : data.task.revision
                , code_path : data.task.code_path };
            data.task = task;
            reslove(data);
            break;
        default:
            data.error = 'task type error. ' + data.task.type;
            logger.error(data.error);
            reject(data);
            break;
    }
}

function sendRerunRequest(data, reslove, reject)
{
    var options = {
        port: MasterStore.port,
        hostname: MasterStore.ip,
        method: 'POST',
        path: '/master/CI/rerun/' + data.original_id,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    var postData = JSON.stringify(data.task);
    sendHttpRequest(options, postData, function (err, res, chunk) {
        if (err || !chunk)
        {
            data.error = 'master response error ' + err;
            logger.error(data.error);
            reject(data);
        }
        else
        {
            logger.info('master response. ', chunk);
            data.result = JSON.parse(chunk);
            reslove(data);
        }
    });
}

function rerunAutoTask(taskID, callback)
{
    if (MasterStore.status == STATUS_LOST)
    {
        callback("master is lost");
        return;
    }

    logger.info('rerunAutoTask :', taskID);

    makePromise(getTaskPromise, {task : {id : taskID}, original_id : taskID})
        .then(makePromiseFunction(processRerun), defaultErrorProcess)
        .then(makePromiseFunction(sendRerunRequest), defaultErrorProcess)
        .done(function (data){
            callback(data.error, data.result);
        },function (data){
            logger.error(data.error);
            callback(data.error, data.result);
        });

    return ; 
}

function findTaskInfo(filter, callback)
{
    var resultArray = [];
    logger.info("moduler find task info start. filter ", filter);
    if (filter.major_id)
    {
        var select = { resource : { major_id : parseInt(filter.major_id)}};

        if (filter.minor_id)
        {
            select.resource.minor_id = parseInt(filter.minor_id);
        }

        logger.info("moduler find task info . select ", select);
        var query = database.TaskRecord.find(select);

        query.select({id : 1
            , rerun_id : 1
            , date : 1
            , user : 1
            , status : 1
            , code_path : 1
            , revision : 1
            , test_group : 1
            , result : 1
            , log_file : 1
            , bin_file : 1});

        query.sort({id : -1});

        if (filter.count)
        {
            query = query.limit(filter.count);
        }

        query.exec(function(err, docs){
            docs.forEach(function(item){
                item = item.toObject();
                var taskInfo = new Object;
                taskInfo.id = item.id;
                taskInfo.rerun_id = item.rerun_id;
                taskInfo.date = item.date;
                taskInfo.user = item.user;
                taskInfo.status = item.status;
                taskInfo.code_path = item.code_path;
                taskInfo.revision = item.revision;
                taskInfo.bin_file = item.bin_file;
                taskInfo.test_group = item.test_group;
                taskInfo.result = item.result;
                taskInfo.log_file = item.log_file;
                taskInfo.fail_message = item.fail_message;
                resultArray.push(taskInfo);
            });
            callback(err, resultArray);
        });
    }
    else
    {
        callback("error. only support major_id and minor_id", null);
    }
}

function getLastEIBasicInfo(filter, callback)
{
    redisEi.pipeline().lindex(key_value[filter.id], -1).exec(function (err, str){
        var result = null;
        if (str)
        {
            result = JSON.parse(str[0][1]);
        }
        callback(err, result);
    });
}

module.exports = function (db) {
    database = db;
    fileManager = file_manager(db);
    return {
        'getTask' : getTask,
        'createAutoTask' : createAutoTask,
        'rerunAutoTask' : rerunAutoTask,
        'createTask' : createTask,
        'findTaskInfo' : findTaskInfo,
        'getLastEIBasicInfo' : getLastEIBasicInfo
    };
};
