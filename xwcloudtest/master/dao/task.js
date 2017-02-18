var child_process = require('child_process');
var util = require('util');
var url = require('url');
var ftp = require('ftp');
var Q = require('q');

var database = undefined;

function getTask(task, callback)
{
    database.TaskRecord.find(task).sort({date : -1 }).exec(function (err, docs) {
        callback(err, docs);
    });
   return ;
}

function getTaskByID(data, reslove, reject)
{
    database.TaskRecord.findOne({id : data.task.id}).sort({date : -1 }).exec(function (err, doc) {
        if (err || !docs)
        {
            data.error = err.message;
            reject(data);
        }
        else
        {
            data.task = doc;
            reslove(data);
        }
    });
   return ;
}

function updateSimResourceSubStatus(argv, reslove, reject)
{
    var index = 0;
    var resource = null;

    logger.info("update sim resource status start ");

    resource = argv.resource;

    for(index = 0; index < resource.report_info.length; index++)
    {
        if (resource.report_info[index].minor_id === parseInt(argv.task['resource'].minor_id))
        {
            break;
        }
    }

    if (index >= resource.report_info.length)
    {
        logger.info("not found resource. ");
        argv.error = "not found resource";
        reject(argv);
    }
    else
    {
        if (resource.report_info[index].status !== argv.before)
        {
            logger.info("resource status is " + resource.report_info[index].status);
            argv.error = "resource status is " + resource.report_info[index].status;
            reject(argv);
        }
        else
        {
            resource.report_info[index].status = argv.after;
            database.Resource.update({major_id : resource.major_id
                                    ,"report_info.minor_id" : resource.report_info[index].minor_id},
                                    {$set : {"report_info.$.status": resource.report_info[index].status}})
              .exec(function(err){
                if (err)
                {
                    logger.info("resource sim update fail. ", err);
                    argv.error = "resource sim update fail.";
                    reject(argv);
                }
                else
                {
                    argv.task.sub_index = index;
                    argv.task.resource_snapshot = resource.toObject();
                    argv.task.resource_snapshot.sub_index = index;
                    reslove(argv); 
                }
            });
        }
    }
}

function updateRealResourceStatus(argv, reslove, reject)
{
    var resource = null;
    var modifyPara = {};

    logger.info("update real resource status start ");

    resource = argv.resource;

    if (resource.report_info[0].status !== argv.before)
    {
        argv.error = "resource bbu status is " + resource.report_info[0].status;
        logger.info(argv.error);
        reject(argv);
    }
    else
    {
        for(var subResIndx=0;subResIndx < resource.report_info.length;subResIndx++ ){
            resource.report_info[subResIndx].status = argv.after;
        }

        resource.save(function(err){
            if (err)
            {
                logger.info("resource save fail. ", err, resource);
                argv.error = "resource save fail.";
                reject(argv);
            }
            else
            {
                argv.task.sub_index = 0;
                argv.task.resource_snapshot = resource.toObject();
                reslove(argv); 
            }
        });
    }
}

function updateResourceStatus(argv, reslove, reject)
{
    var selector = {"major_id" : parseInt(argv.task['resource'].major_id)};

    logger.info("update resource status start ");

    database.Resource.findOne(selector)
      .exec(function (err, resource) {
        if (err)
        {
            logger.info("update resource status error. ", err);
            argv.error = err;
            reject(argv);
        }
        else
        {
            argv.resource = resource;

            logger.debug("update resource status ok . ", resource);
            if (resource.status === 'lost')
            {
                argv.error = 'resource status is lost';
                reject(argv);
                return;
            }

            switch (resource.type)
            {
                case 'simulation':
                    updateSimResourceSubStatus(argv, reslove, reject);
                    break;
                case 'real':
                    if (resource.status !== 'lost')
                    {
                        updateRealResourceStatus(argv, reslove, reject);
                    }
                    else
                    {
                        argv.error = 'resource bbu status is lost';
                        resource.status = "lost";
                        reject(argv);
                    }
                    break;
                default:
                    argv.error = 'task type error. ' + argv.task.type;
                    logger.error(argv.error);
                    reject(argv);
                    break;
            }
        }
    });
}

function setResourceStatus(argv, reslove, reject)
{
    argv.before ='idle';
    argv.after ='busy';

    var resource = argv.resource;

    logger.info("set resource status start ", argv);

    switch (resource.type)
    {
        case 'simulation':
            updateSimResourceSubStatus(argv, reslove, reject);
            break;
        case 'real':
            if (resource.status !== 'lost')
            {
                updateRealResourceStatus(argv, reslove, reject);
            }
            else
            {
                argv.error = 'resource bbu status is lost';
                resource.status = "lost";
                reject(argv);
            }
            break;
        default:
            argv.error = 'task type error. ' + resource.type + ' type ' + typeof(resource.type);
            logger.error(argv.error);
            reject(argv);
            break;
    }
}

function failUpdateSimResourceSubStatus(data, reslove, reject)
{
    logger.info("fail Update Sim Resource Sub Status start");

    if (data.task && ( data.task['sub_index'] != undefined || data.task.resource_snapshot != undefined))
    {
        var resource = data.task.resource_snapshot;
        if (data.task.resource_snapshot)
        {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot)
        {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }
        database.Resource.update({major_id : resource.major_id
                                 , "report_info.minor_id" : resource.sub_resource[data.task.sub_index].minor_id}
                                ,{$set : {"report_info.$.status": 'idle'}}
                                , function(err){
            if (data.task.resource_snapshot)
            {
                data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
            }

            if (data.task.taskgroup_snapshot)
            {
                data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
            }

            if (err)
            {
                logger.info("fail Update Sim Resource Sub Status. ", err);
            }
            reject(data);
        });
    }
    else
    {
        reject(data);
    }
}

function failUpdateRealResourceStatus(data, reslove, reject)
{
    logger.info("fail Update real Resource Sub Status start");
    if (data.task && (data.task.resource_snapshot != undefined))
    {
        var resource = data.task.resource_snapshot;
        if (data.task.resource_snapshot)
        {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot)
        {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }

        database.Resource.findOne({major_id : resource.major_id})
          .exec(function(err, obj){
            if (err)
            {
                logger.info("fail Update Sim Resource Sub Status. ", err);
                reject(data);
            }
            else
            {
                obj.report_info.forEach(function(item){
                    item.status = RESOURCE_STATUS_IDLE;
                });
                obj.save(function(err){
                    if (err)
                       logger.info("fail Update Sim Resource Sub Status. 2", err);

                    if (data.task.resource_snapshot)
                    {
                        data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
                    }

                    if (data.task.taskgroup_snapshot)
                    {
                        data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
                    }

                    reject(data);
                });
            }
        });
    }
    else
    {
        reject(data);
    }
}

function failupdateResourceSubStatus(data, reslove, reject)
{
    logger.info("fail Update Resource Sub Status start",data);

    switch(data.task.resource_snapshot.type)
    {
        case 'real':
            failUpdateRealResourceStatus(data, reslove, reject);
            break;
        case 'simulation':
            failUpdateSimResourceSubStatus(data, reslove, reject);
            break;
        default:
            logger.error('resource type error. ', data.task.resource_snapshot.type, ' type : ', typeof(data.task.resource_snapshot.type));
            reject(data);
            break;
    }
}

function saveTaskRecord(data, reslove, reject)
{
    var taskObj = data.task;

    logger.info("create task record start ");

    taskObj.id = taskCurrentIndex ++;
    //taskObj.type = new String(task.type).toLowerCase();
    taskObj.status = 'run';
    taskObj.result = 'fail';
    taskObj.run_time = 0;
    // taskObj.fail_message = undefined;
    taskObj.logs = [];

    if (data.task.resource_snapshot)
    {
        data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
    }

    var taskRecord = new database.TaskRecord(taskObj);
    taskRecord.save(function (err) {
        if (data.task.resource_snapshot)
        {
            data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
        }

        if (err)
        {
            logger.info("save task record error. ", err.message);
            logger.info("error : ", err);
            data.error = err.message;
            reject(data);
        }
        else
        {
            logger.info("save task record success. ");
            reslove(data);
        }
    });
}

function updateTaskRecord(data, reslove, reject)
{
    logger.info("update task record start ");

    if (data.task.resource_snapshot)
    {
        data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
    }

    if (data.task.taskgroup_snapshot)
    {
        data.task.taskgroup_snapshot.current_index = data.task.sub_index;
        data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
    }

    database.TaskRecord.update({id : data.task.id}, {$set : data.task}, function (err) {
        if (data.task.resource_snapshot)
        {
            data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot)
        {
            data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
        }

        if (err)
        {
            logger.error("update task. ", err);
            data.error = err.message;
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function taskFailupdateTaskRecord(data, reslove, reject)
{
    logger.info("task fail update task record start ");

    if (data.task && (data.task.id != undefined))
    {
        data.task.result = 'fail';
        data.task.status = 'close';
        data.task.fail_message = data.error;
        data.task.logs.push(data.error);

        if (data.task.resource_snapshot)
        {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot)
        {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }

        logger.info("task fail update task record ");
        database.TaskRecord.update({id : data.task.id}, {$set : data.task}, function (err) {
            if (data.task.resource_snapshot)
            {
                data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
            }

            if (data.task.taskgroup_snapshot)
            {
                data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
            }

            if (err)
            {
                logger.error("update task. ", err);
            }
            reject(data);
        });
    }
    else 
    {
        reject(data);
    }
}

function createTestFrameworkPara(data, reslove, reject)
{
    logger.info("run create Test Framework Para start ");

    if (!data.task.test_group)
    {
        data.error = 'not choice test group.';
        reject(data);
        return;
    }

    database.TestGroup.findOne({name : data.task.test_group}).exec(function (err, testgroup){
        if (err || !testgroup)
        {
            logger.error("find test group error. ", err);
            if (err)
            {
                data.error = err.message;
            }
            else
            {
                data.error = 'not found test group : \'' + data.task.test_group + '\'';
            }
            reject(data);
        }
        else
        {
            var root = createXmlRoot('InitConfig');
            root.ele('TaskDriver', {}, 0);
            root.ele('CurEnvironment', {}, '0');
            if (data.task.code_path)
            {
                root.ele('Compile', {url : data.task.code_path
                    , revision : data.task.revision
                    , svn_user : data.task.svn.user
                    , svn_password : data.task.svn.password
                });
            }
            var testtask = root.ele('TestTask');
            logger.info('test group : ', testgroup);

            var subResource = data.task.resource_snapshot.sub_resource[data.task.sub_index];
            var testgroupname = testgroup.name;
            var testgroupXML = testtask.ele('TestCaseGroup', {name: testgroupname});
            testgroupXML.ele('EnbId', {}, subResource.enbID);

            data.task.taskgroup_snapshot = { name : testgroupname, type : testgroup.type };

            data.task.taskgroup_snapshot.testcase = [];

            testgroup.testcase.forEach(function(item){
                logger.debug('test case : ', item);
                data.task.taskgroup_snapshot.testcase.push(item);
                testgroupXML.ele('TestCase', {name : item.name, times : 1});
            });
            
            data.task.taskgroup_snapshot.xml = root.end({ pretty: true, indent: '  ', newline: '\n' });

            reslove(data);
        }
    });
}

function createTestCasePara(data, reslove, reject)
{
    logger.info("run create Test Case Para start ");

    var subResource = data.task.resource_snapshot.sub_resource[data.task.sub_index];

    var testcaseIDArray = [];
     
    data.task.taskgroup_snapshot.testcase.forEach(function (item){
        testcaseIDArray.push(item.id);
    });

    logger.info("testcaseIDArray : ", testcaseIDArray);

    try {
        database.TestCase.find({id : {$in : testcaseIDArray}}).exec(function (err, list){

            });

            reslove(data);
        });
    }catch(e){
        logger.info('error : ', e);
        data.error = e;
        reject(data);
    }
}

function chooseSimResource(data, reslove, reject)
{
    logger.info("run choose simulation resource start ");
    database.Resource.find({"type" : "simulation", "report_info.resource_type" : "auto", "report_info.status" : "idle"}).exec(function(err, list){
        if (err)
        {
            logger.info("not find idle simulation resource", err);
            data.error = err;
            reject(data);
        }
        else if (!list || list.length == 0)
        {
            logger.info("not find idle simulation resource, cache task", list);
            data.error = "not find idle simulation resource, cache task";
            reject(data);
        }
        else
        {
            var resource = undefined;
            list[0].report_info.forEach(function(item){
                if (resource == undefined && item.status == 'idle')
                {
                    resource = item;
                }
            });
            data.task['resource'] = { major_id : list[0].major_id, minor_id : resource.minor_id};
            data.resource = list[0];
            reslove(data);
        }
    });
}

function chooseRealResource(data, reslove, reject)
{
    logger.info("run choose real resource start ");
    database.Resource.find({
        "type": "real",
        "status": "normal",
        "report_info.resource_type": "auto",
        "report_info.status": "idle"
    }).exec(function (err, list) {
        if (err) {
            logger.info("not find idle real resource", err);
            data.error = err;
            reject(data);
        }
        else if (!list || list.length == 0) {
            logger.info("not find idle real resource, cache task", list);
            data.error = "not find idle real resource, cache task";
            reject(data);
        }
        else {
            var resource = undefined;
            // list[0].report_info.forEach(function (item) {
            //     if (resource == undefined && item.status == 'idle') {
            //         resource = item;
            //     }
            // });
            data.task['resource'] = {major_id: list[0].major_id};
            data.resource = list[0];
            reslove(data);
        }
    });
}

function chooseResource(data, reslove, reject)
{
    logger.info("run choose resource start ");

    if(data.task.type === 'real')
    {
        chooseRealResource(data, reslove, reject);
    }
    else if(data.task.type === 'simulation')
    {
        chooseSimResource(data, reslove, reject)
    }
    else
    {
        logger.info("not find task type!", err);
        data.error = err;
        reject(data);
    }
}

function chooseTestGroup(data, reslove, reject)
{
    logger.info("run choose Test Group start ");
    database.CIConfig.find({type : data.task.type, env_type : data.task.env_type})
        .exec(function(err, list){
            if (err)
            {
                data.error = err;
                reject(data);
            }
            else if (! list || list.length == 0)
            {
                data.error = 'not found ci config';
                reject(data);
            }
            else
            {
                data.ciConfig = list[0].toObject();
                data.task.test_group = list[0].test_group;

                if (data.task.type === 'real')
                {
                    data.task.user = list[0].Another_Name;
                }

                data.task.ciConfig = data.ciConfig;
                reslove(data);
            }
    });
}

module.exports = function (db) {
    database = db;

    return {
        'getTask' : getTask,
        'createTask' : createTask,
        'taskReport' : taskReport,
        'taskResult' : taskResult,
        'createAutoTask' : createAutoTask,
        'rerunAutoTask' : rerunAutoTask,
    };
}