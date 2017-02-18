var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
var url = require('url');
var ftp = require('ftp');
var Q = require('q');
var xmlbuilder = require('xmlbuilder');
var Redis = require('ioredis');

var redis_messageQ = new Redis({port:config.cache.port, host:config.cache.ip});

// redis.monitor(function (err, monitor) {
//   // Entering monitoring mode.
//   logger.info('redis monitor err ' + err + ' monitor ' + monitor);
//   monitor.on('monitor', function (time, args) {
//     console.log(time + ": " + util.inspect(args));
//   });
// });

var TaskStory = {};

function makeTaskTempDir(data, reslove, reject)
{
    logger.info("run make Test temp dir start ");

    var tmpPath = config.slave.temp_path + '\\' +data.task.id;
    var testframwrok_path = config.slave.testframwrok_path;

    data.tempPath = tmpPath;

    try {
        fs.mkdirSync(tmpPath, 0777);
    }
    catch (e)
    {
        if ('EEXIST' == e.code)
        {
            logger.info('file already exists ', e.path);
        }
        else
        {
            logger.info("e ", e);
            data.error = e;
            reject(data);
            return;
        }
    }

    var logPath = tmpPath + '/log';

    data.logPath = logPath;

    try {
        fs.mkdirSync(logPath, 0777);
        reslove(data);
    }
    catch (e)
    {
        if ('EEXIST' == e.code)
        {
            logger.info('file already exists ', e.path);
            reslove(data);
        }
        else
        {
            logger.info("e ", e);
            data.error = e;
            reject(data);
        }
    }
}

function createTestGroupXML(data, reslove, reject)
{
    var testgroupname = data.task.test_group;
    var testXmlPath = data.tempPath + '/TestCaseGroup';
    try {
        fs.mkdirSync(testXmlPath, 0777);
    }
    catch (e)
    {
        if ('EEXIST' == e.code)
        {
            logger.info('file already exists ', e.path);
        }
        else
        {
            logger.info("e ", e);
            data.error = e;
            throw data;
        }
    }

    try {
        fs.mkdirSync(testXmlPath + '/' + testgroupname, 0777);
    }
    catch (e)
    {
        if ('EEXIST' == e.code)
        {
            logger.info('file already exists ', e.path);
        }
        else
        {
            logger.info("e ", e);
            data.error = e;
            throw data;
        }
    }

    logger.info("test group xml path : ", testXmlPath);
    data.task.testXmlPath = testXmlPath;

    var fd = fs.openSync(testXmlPath + '/' +'StartConfig.xml', 'w+', 0777)
    fs.writeSync(fd, data.task.taskgroup_snapshot.xml, 0, 'UTF-8');
    fs.closeSync(fd);

    reslove(data);
}

function createTestCaseXML(data, reslove, reject)
{
    for (var name in data.task.taskgroup_snapshot.testcase)
    {
        var testcaseXmlFile = data.task.testXmlPath +'/' + data.task.taskgroup_snapshot.name;
        testcaseXmlFile = testcaseXmlFile + '/' + 'TestCase_' + name + '.xml';

        var fd = fs.openSync(testcaseXmlFile, 'w+', 0777);
        fs.writeSync(fd, data.task.taskgroup_snapshot.testcase[name], 0, 'UTF-8');
        fs.closeSync(fd);
    }

    reslove(data);
}

function notifyView(data, reslove, reject)
{
    logger.info("notify view start ");

    if (!data.callAsync)
    {
        data.callAsync = true;
        data.async(data.error, data.task);
    }

    if (data.error)
    {
        reject(data);
    }
    else
    {
        reslove(data);
    }
}

function makeEnbDir(data, reslove, reject)
{
    var versionPath = data.tempPath + '/version';

    logger.info('make Enb Dir start');

    data.task.versionPath = versionPath;

    try {
        fs.mkdirSync(versionPath, 0777);
        reslove(data);
    }
    catch (e)
    {
        if ('EEXIST' == e.code)
        {
            logger.info('dir already exists ', e.path);
            reslove(data);
        }
        else
        {
            logger.info("e ", e);
            data.error = e;
            reject(data);
        }
    }
}

function connectFtp(data, reslove, reject)
{
    var ftpArgv = data.task.measured_object.ftp;

    logger.info('connect ftp start');

    var ftpClient = new ftp();

    ftpClient.on('ready', function () {
        data.ftpClient = ftpClient;
        reslove(data);
    });

    ftpClient.on('error', function(err) {
        ftpClient.end();
        logger.error('ftp error. ', err);
        data.error = err;
        reject(data);
    });

    ftpClient.connect(ftpArgv);
}

function ftpGetVersionFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp Get version File start');

    ftpClient.get(task.measured_object.exe_file, function (err, stream) {
        if (err)
        {
            logger.error("ftp get error. ", err);
            data.error = err;
            reject(data);
        }
        else
        {
            stream.once('close', function() {
                logger.info("ftp get exe end");
                reslove(data); 
            });
            stream.pipe(fs.createWriteStream(data.task.versionPath + '/' + data.task.measured_object.ftp.original));
        }
    });
}

function ftpDelVersionFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp del Exe File start');

    if (data.task.measured_object.ftp.host !== config.ftp.ip)
    {
        logger.info('not delete version file');
        reslove(data);
        return;
    }

    ftpClient.delete(task.measured_object.exe_file, function (err) {
        if (err)
        {
            logger.error("ftp del error. ", err);
            data.error = error;
            reject(data);
        }
        else
        {
            logger.info("ftp delete exe end");
            reslove(data);
        }
    });
}

function endFtpConnect(data, reslove, reject)
{
    logger.info('end Ftp Connect start');

    try {
        data.ftpClient.end();
    }catch(e){
        logger.info('ftp end error. ', e);
    }

    if (data.error)
    {
        reject(data);
    }
    else
    {
        reslove(data);
    }
}

function ftpGetTestFile(data, reslove, reject)
{
    var task = data.task;
    if (data.task.measured_object.ftp)
    {
        makePromise(makeEnbDir, { task : task, tempPath : data.tempPath })
              .then(makePromiseFunction(connectFtp), defaultErrorProcess)
              .then(makePromiseFunction(ftpGetVersionFile), defaultErrorProcess)
              .then(makePromiseFunction(ftpDelVersionFile), defaultErrorProcess)
              .then(makePromiseFunction(endFtpConnect), makePromiseFunction(endFtpConnect))
              .done(function (result){
                logger.info('ftpGetTestFile success. ', result.error ? result.error : "");
                reslove(data);
              }, function (result){
                logger.info('ftpGetTestFile fail. ', result.error)
                data.error = result.error;
                reject(data);
              }, undefined);
    }
    else
    {
        var message = 'exe_file is ' + task.measured_object.exe_file + ' db_file is ' + task.measured_object.db_file; 
        logger.info(message);                
        reslove(data);
    }
}

function runTask(data, reslove, reject)
{
    var task_key = {};

    logger.info("run task start");

    task_key[data.task.id] = data.task.resource_snapshot.name + '_' + data.task.id;

    data.task.cache_key = task_key[data.task.id];

    logger.error("data1.task.cache_key : ", data.task.cache_key);

    redis_messageQ.publish('task_key', JSON.stringify(task_key));

    var para = ["-u", "AutoTest","test"];
    if (data.task.measured_object.ftp)
    {
        para.push('--versionpath');
        para.push(data.task.versionPath);
    }

    para.push("--enbip");
    para.push(config.database.config.sub_resource[0].ip);

    para.push("--epcip");
    para.push(config.database.config.sub_resource[0].epcip);

    para.push("--enbid");
    para.push(config.database.config.sub_resource[0].enbID);

    para.push("--enbname");
    para.push(config.database.config.sub_resource[0].enbName);

    para.push("--grouppath");
    para.push(data.task.testXmlPath);

    para.push("--logpath");
    para.push(data.logPath);

    para.push("--redis");
    para.push(config.cache.ip);
    
    para.push("--rport");
    para.push(config.cache.port);

    para.push("--rkey");
    para.push(data.task.cache_key);
    
    para.push("--slave_ue");
    para.push(config.slave_ue.ip);

    para.push("--sue_port");
    para.push(config.slave_ue.port);

    logger.debug(para);
    child = child_process.spawn("python", para, {cwd:config.slave.testframwrok_path});

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', function(message){
        logger.info('stdout : ' + message);
        //redis.pipeline().lpush(data.task.cache_key, JSON.stringify({message : message})).exec(function(err){
        //    if (err)
        //        logger.info('stdout redis ' , util.inspect(arguments, {showHidden : true, depth : null}));
        //});
    });

    child.stderr.on('data', function(message){
        //var message = buff.toString('UTF-8');
        logger.error('stderr : ' + message);
        //redis.pipeline().lpush(data.task.cache_key, JSON.stringify({message : message})).exec(function(err){
        //    if (err)
        //        logger.info('stderr redis ' , util.inspect(arguments, {showHidden : true, depth : null}));
        //});
    });

    child.on('close', function (code, signal) {
        if (code !=0 )
        {
            data.error = 'python script return ' + code;
            logger.error('python script return ' + code);
            reslove(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function tarLogFile(data, reslove, reject)
{
    var taskObj = data.task;
    var resource = data.task.resource_snapshot;
    var tarName = taskObj.id + '_testlog.zip';
    var cmd = 'python -u zip.py ' + tarName + ' ' + data.tempPath;

    logger.info("tar log file start .");

    child_process.exec(cmd, function (error, stdout, stderr) {
        logger.debug('error :', error);
        logger.debug('stdout :', stdout);
        logger.debug('stderr :', stderr);
        if (error !== null) {
            logger.error('exec error: ' + error);
            data.error = error;
            reject(data);
        }
        else
        {
            child_process.execSync("rd /s /q " + data.tempPath);
            reslove(data);
        }
    });
    logger.info("tar log file end ");
}

function tarLogFileUploadToFtp(data, reslove, reject)
{
    var taskObj = data.task;
    var ftpArgv = {host :config.ftp.ip, port : config.ftp.port, user : config.ftp.user, password : config.ftp.password};

    logger.info("upload log file start ");
 
    var tarName = taskObj.id + '_testlog.zip';

    var ftpClient = new ftp();

    ftpClient.on('ready', function () {
        ftpClient.cwd(config.ftp.upload_path, function (err, currentDir) {
            if (err)
            {
                logger.error('ftp cwd error. ', err);
                ftpClient.end();
                data.error = error;
                reject(data);
                return ;
            }
 
            ftpClient.put(tarName, tarName, function (err) {
                if (err)
                {
                    logger.error("ftp put error. ", err);
                    data.error = error;
                    reject(data);
                }
                else
                {
                    taskObj.log_file = 'ftp://' + config.ftp.user + ':' + config.ftp.password + '@' + config.ftp.ip + ':' + config.ftp.port +'/' + config.ftp.upload_path + '/' + tarName;
                    fs.unlink(tarName);
                    reslove(data);
                }
                logger.info("ftp put end");
                ftpClient.end();
            });
        });
    });

    ftpClient.on('error', function(err) {
        ftpClient.end();
        logger.error('ftp error. ', err);
        data.error = err;
        reject(data);
    });

    ftpClient.connect(ftpArgv);
}

function reportTaskResult(id)
{
    var task = TaskStory[id];

    task.run_time = new Date().getTime() - task.date.getTime();

    var postData = {
        task_id : task.id,
        status : task.status,
        result : task.result,
        run_time : task.run_time,
        cache_key : task.cache_key,
        test_group : task.test_group,
        resource : task.resource,
        fail_message : task.fail_message,
        log_file : task.log_file
    };

    var options = {
        port: config.master.port,
        hostname: config.master.ip,
        method: 'POST',
        path: '/slave/task/result',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    sendHttpRequest(options, JSON.stringify(postData), function (err, res, chunk) {
        if (err) logger.error(err);
    });
    delete TaskStory[id];

    SlaveManager.changeToIdle();
}

function reportTaskStatus(id)
{
    var task = TaskStory[id];

    task.run_time = new Date().getTime() - task.date.getTime();

    var postData = {
        task_id : task.id,
        status : task.status,
        result : task.result,
        run_time : task.run_time,
        fail_message : task.fail_message,
        testcase : '',
        step : ''
    };

    var options = {
        port: config.master.port,
        hostname: config.master.ip,
        method: 'POST',
        path: '/slave/task/report',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    };

    sendHttpRequest(options, JSON.stringify(postData), function (err, res, chunk) {
        if (err) logger.error(err);
    });
}

function startReportTimer(data, reslove, reject)
{
    data.timeObject = setInterval(reportTaskStatus, config.slave.task_report_interval, data.task.id);

    TaskStory[data.task.id] = data.task;

    data.task.date = new Date();

    reslove(data);
}

function createTask (task,callback)
{
    var id = task.id;
    logger.info("create task start ");

    SlaveManager.changeToBusy();

    makePromise(startReportTimer, {task : task, async : callback})
          .then(makePromiseFunction(notifyView), makePromiseFunction(notifyView))
          .then(makePromiseFunction(makeTaskTempDir), defaultErrorProcess)
          .then(makePromiseFunction(createTestGroupXML), defaultErrorProcess)
          .then(makePromiseFunction(createTestCaseXML), defaultErrorProcess)
          .then(makePromiseFunction(ftpGetTestFile), defaultErrorProcess)

          .then(makePromiseFunction(runTask), defaultErrorProcess)

          .then(makePromiseFunction(tarLogFile), makePromiseFunction(tarLogFile))
          .then(makePromiseFunction(tarLogFileUploadToFtp), makePromiseFunction(tarLogFileUploadToFtp))
          .done(function (data) {
                clearInterval(data.timeObject);
                reportTaskResult(id);
                logger.info('test task complete. result : ', data.task.result);
             }, function (data) {
                clearInterval(data.timeObject);
                TaskStory[id].result = 'fail';
                TaskStory[id].status = 'close';
                TaskStory[id].fail_message = data.error ? data.error : data;
                reportTaskResult(id);
                logger.info("done function. data : ", data.error ? data.error : data);
             }, undefined);

    return ; 
}

module.exports = function (db) {
    return {
        'createTask' : createTask,
    };
};