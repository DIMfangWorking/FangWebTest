var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
var url =  require('url');
var ftp = require('ftp');
var Q = require('q');
var xmlbuilder = require('xmlbuilder');

var docker = require("./docker.js");

var SvnPath = [];

/* docker manager start */
var TaskStory = {};

function getTask(task, callback)
{
    database.TaskRecord.find(task).sort({date : -1 }).exec(function (err, docs) {
        callback(err, docs);
    });
   return ;
}

function createContainer(data, reslove, reject)
{
    logger.info("create container start ");

    docker.runContainer(data.task, function (err, container) {
        logger.info("create container ", err);
        if (err)
        {
            logger.info("run container error. ", err);
            data.error = err;
            reject(data);
        }
        else
        {
            logger.info('run container');
            reslove(data);
        }
    });
}

function makeTaskTempDir(data, reslove, reject)
{
    logger.info("run make Test temp dir start ");

    var subResource = data.task.resource_snapshot.sub_resource[data.task.sub_index];
    var tmpPath = config.slave.temp_path + '/' + subResource.name;
    var testframwrok_path = config.slave.testframwrok_path;

    data.tempPath = tmpPath;

    if (!data.task['mapPath'])
        data.task.mapPath = [];

    var mapping = {};
    mapping[testframwrok_path] = testframwrok_path;

    data.task.mapPath.push(mapping);

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

    mapping = {};
    mapping[logPath] = testframwrok_path+'/log';

    data.task.mapPath.push(mapping);

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

    var mapping = {}
    mapping[testXmlPath] = config.slave.testframwrok_path + '/TestCaseGroup';

    data.task.mapPath.push(mapping);

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

function makeEnbDir(data, reslove, reject)
{
    var testframwrok_path = config.slave.testframwrok_path;
    var enbPath = data.tempPath + '/enb';
    var mapping = {};

    logger.info('make Enb Dir start');

    data.enbPath = enbPath;

    mapping[enbPath] = testframwrok_path + '/enb/output';
    data.task.mapPath.push(mapping);

    try {
        fs.mkdirSync(enbPath, 0777);
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

function makeCodeDir(data, reslove, reject)
{
    var mapping = {};

    logger.info('make Code Dir start', data.task.task_type);

    if (data.task.task_type == 'auto')
    {
        logger.info('make Code Dir start', data.task.code_path);
        logger.info('make Code Dir start', config.sim_slave.code_prefetch.path);
        if (data.task.code_path == config.sim_slave.code_prefetch.path)
        {
            var index = getNotUseSvnPath()
            logger.info('make Code Dir index', index);
            if (util.isNumber(index))
            {
                var pathSvnPath = SvnPath[index];
                pathSvnPath.isUse = true;
                data.code_prefetch = index;

                mapping[pathSvnPath.path] = '/home/guow/code';
                // updateSvnCode(config.sim_slave.code_prefetch.user,
                //     config.sim_slave.code_prefetch.password,
                //     data.task.revision, pathSvnPath,
                //     reslove, reject);
                data.task.mapPath.push(mapping);
                reslove(data);
            }
            else
            {
                data.error = 'not found code_prefetch' + SvnPath;
                logger.info(data.error);
                reject(data);
            }
        }
        else
        {
            reslove(data);
        }
    }
    else
    {
        reslove(data);
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

function ftpGetExeFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp Get Exe File start');

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
            stream.pipe(fs.createWriteStream(data.enbPath + '/' + task.measured_object.ftp.original_exe));
        }
    });
}

function ftpDelExeFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp del Exe File start');

    if (data.task.measured_object.ftp.host !== config.ftp.ip)
    {
        logger.info('not delete Exe File');
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

function chmodExeFile(data, reslove, reject)
{
    logger.info('chmod Exe Files start');

    fs.chmod(data.enbPath + '/' + data.task.measured_object.ftp.original_exe, 0777, function(err){
        if (err)
        {
            logger.error("chmod Exe File error. ", err);
            data.error = error;
            reject(data);
        }
        else
        {
            logger.info("chmod Exe File end");
            reslove(data);
        }
    });
}

function ftpGetDBFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp get db File start');

    ftpClient.get(task.measured_object.db_file, function (err, stream) {
        if (err)
        {
            logger.error("ftp get error. ", err);
            data.error = error;
            reject(data);
        }
        else
        {
            stream.once('close', function() {
                logger.info("ftp get db end");
                reslove(data); 
            });
            stream.pipe(fs.createWriteStream(data.enbPath + '/' + task.measured_object.ftp.original_db));
        }
    });
}

function ftpDelDBFile(data, reslove, reject)
{
    var ftpClient = data.ftpClient;
    var task = data.task;

    logger.info('ftp del db File start');

    if (data.task.measured_object.ftp.host !== config.ftp.ip)
    {
        logger.info('not delete db File');
        reslove(data);
        return;
    }

    ftpClient.delete(task.measured_object.db_file, function (err) {
        if (err)
        {
            logger.error("ftp del error. ", err);
            data.error = error;
            reject(data);
        }
        else
        {
            logger.info("ftp del db end");
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

    if (task.measured_object && task.measured_object.ftp)
    {
        makePromise(connectFtp, { task : task, tempPath : data.tempPath, enbPath : data.enbPath})
              .then(makePromiseFunction(ftpGetExeFile), defaultErrorProcess)
              .then(makePromiseFunction(ftpDelExeFile), defaultErrorProcess)
              .then(makePromiseFunction(chmodExeFile), defaultErrorProcess)
              .then(makePromiseFunction(ftpGetDBFile), defaultErrorProcess)
              .then(makePromiseFunction(ftpDelDBFile), defaultErrorProcess)
              .then(makePromiseFunction(endFtpConnect), makePromiseFunction(endFtpConnect))
              .done(function (result){
                logger.info('ftpGetTestFile success. ', result.error ? result.error : result)
                reslove(data);
              }, function (result){
                logger.info('ftpGetTestFile fail. ', result.error)
                data.error = result.error;
                reject(data);
              }, undefined);
    }
    else
    {
        logger.info('not ftp down exe and db file.');
        reslove(data);
    }
}

function tarLogFile(data, reslove, reject)
{
    var taskObj = data.task;
    var resource = data.task.resource_snapshot.sub_resource[data.task.sub_index];
    var tarName = taskObj.id + '_testlog.tar.gz';
    var cmd = 'tar -zcvf ' + tarName + ' -C ' + config.slave.temp_path + ' ' + resource.name;

    logger.info("tar log file start .");

    //var spawnResult = spawn('tar -zcvf ' + tarName + ' /root/CI/LinuxTestManager/log/*');
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
            child_process.execSync("rm -rf " + data.tempPath);
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
 
    var tarName = taskObj.id + '_testlog.tar.gz';

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
                    data.error = err;
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

function reportTaskResult(id)
{
    var task = TaskStory[id];

    logger.info('report result. task id ', id);

    var postData = {
        task_id : task.id,
        status : 'close',
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

    logger.info('report result. options ', options);

    sendHttpRequest(options, JSON.stringify(postData), function (err, res, chunk) {
        if (err)
           logger.error('report result err. task id ', id, err);
        logger.info('report result. result ', chunk);
    });

    delete TaskStory[id];
}

function reportTaskStatus(id)
{
    var task = TaskStory[id];

    logger.info('report status. task id ', id);

    var postData = {
        task_id : task.id,
        status : task.status,
        result : task.result,
        run_time : task.run_time,
        fail_message : task.fail_message,
        testcase : '',
        step : ''
    }

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
        if (err)
           logger.error('report status err. task id ', id, err);
    });
}

function startReportTimer(data, reslove, reject)
{
    data.timeObject = setInterval(reportTaskStatus, config.slave.task_report_interval, data.task.id);

    TaskStory[data.task.id] = data.task;

    reslove(data);
}

function createTask (task,callback)
{
    var id = task.id;
    logger.info("create task start ");

    makePromise(startReportTimer, {task : task, async : callback})
          .then(makePromiseFunction(notifyView), makePromiseFunction(notifyView))
          .then(makePromiseFunction(makeTaskTempDir), defaultErrorProcess)
          .then(makePromiseFunction(makeEnbDir), defaultErrorProcess)
          .then(makePromiseFunction(makeCodeDir), defaultErrorProcess)
          .then(makePromiseFunction(createTestGroupXML), defaultErrorProcess)
          .then(makePromiseFunction(createTestCaseXML), defaultErrorProcess)
          .then(makePromiseFunction(ftpGetTestFile), defaultErrorProcess)
          .then(makePromiseFunction(createContainer), defaultErrorProcess)
          .then(makePromiseFunction(tarLogFile), defaultErrorProcess)
          .then(makePromiseFunction(tarLogFileUploadToFtp), defaultErrorProcess)
          .done(function (data) {
                clearInterval(data.timeObject);
                reportTaskResult(id);
                if (util.isNumber(data.code_prefetch))
                {
                    var pathSvnPath = SvnPath[data.code_prefetch];
                    pathSvnPath.isUse = false;
                }

                logger.info('code prefetch . ', SvnPath);

                logger.info('test task complete. result : ', data.task.result);
             }, function (data) {
                clearInterval(data.timeObject);
                TaskStory[id].result = 'fail';
                TaskStory[id].status = 'close';
                TaskStory[id].fail_message = data.error ? data.error.toString() : data;
                reportTaskResult(id);

                if (util.isNumber(data.code_prefetch))
                {
                    var pathSvnPath = SvnPath[data.code_prefetch];
                    pathSvnPath.isUse = false;
                }

                logger.info('code prefetch . ', SvnPath);

                logger.info("done function. data : ", data.error ? data.error : data);
             }, undefined);

    return ; 
}

function checkoutSvnCode(user, password, url, codepath)
{
    var para = ['checkout'];

    logger.info("checkout Svn Code start ");

    para.push('--username');
    para.push(user);
    para.push('--password');
    para.push(password);
    para.push('--no-auth-cache');
    para.push(url);
    para.push(codepath);

    var result = child_process.spawnSync('svn', para, {encoding:'UTF-8'});
    if (result.status !=0 || result.error)
    {
        logger.error("svn checkout fail.");
        if (result.error)
            logger.error(result.error);
        if (result.stdout)
            logger.error(result.stdout);
        if (result.stderr)
            logger.error(result.stderr);
        process.exit(1);
    }

    return codepath;
}

function updateSvnCode(user, password, revision, codepath, reslove, reject)
{
    var para = ['update'];

    logger.info("update Svn Code start ");

    para.push('--username');
    para.push(user);
    para.push('--password');
    para.push(password);
    para.push('--no-auth-cache');
    para.push('-r')
    para.push(revision);
    para.push(codepath);

    var child = child_process.spawn('svn', para, {encoding:'UTF-8'});
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', function(message){
        logger.info('stdout : ' + message);
    });

    child.stderr.on('data', function(message){
        logger.error('stderr : ' + message);
    });

    child.on('close', function (code, signal) {
        if (code !=0 )
        {
            data.error = 'svn update return ' + code;
            logger.error('svn update return ' + code);
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function getNotUseSvnPath()
{
    var path = undefined;

    SvnPath.forEach(function(item, index){
        if (!item.isUse)
        {
            path = index; 
        }
    });

    return path;
}

module.exports = function (db) {
    for(var i = 0; i < config.sim_slave.code_prefetch.copies; i ++)
    {
        var path = config.slave.temp_path + '/code' + i;
        checkoutSvnCode(config.sim_slave.code_prefetch.user, 
            config.sim_slave.code_prefetch.password,
            config.sim_slave.code_prefetch.path, path)
        SvnPath.push({path : path, isUse : false});
    }

    logger.info('code prefetch complete. ', SvnPath);
    
    return {
        'getTask' : getTask,
        'createTask' : createTask,
    };
};