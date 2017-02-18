var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
var url = require('url');
var ftp = require('ftp');
var Q = require('q');
var xmlbuilder = require('xmlbuilder');
var parseString = require('xml2js').parseString;

var Redis = require('ioredis');
var mysql = require('mysql');

var redis = new Redis({port: config.cache.port, host: config.cache.ip});
var redisEI = new Redis({port: config.cache.port, host: config.cache.ip, db: 2});
var mqUtil;
var slave_manage = require('./slave');
var ei_Detail = require('./loadConfig');

// redis.monitor(function (err, monitor) {
//   // Entering monitoring mode.
//   logger.info('redis monitor err ' + err + ' monitor ' + monitor);
//   monitor.on('monitor', function (time, args) {
//     console.log(time + ": " + util.inspect(args));
//   });
// });

/* docker manager start */
var database = undefined;
var ci_database = undefined;
var slaveManger = undefined;
var eiDetail = undefined;
var taskCurrentIndex = 0;

function getTask(task, callback) {
    mqUtil.sendRequestByRPC("task-getTask", task ,config.gatewayAmqp.taskQueue);
    database.TaskRecord.find(task).sort({date: -1}).exec(function (err, docs) {
        callback(err, docs);
    });
    return;
}

function getTaskByID(data, reslove, reject) {
    database.TaskRecord.findOne({id: data.task.id}).sort({date: -1}).exec(function (err, doc) {
        if (err || !docs) {
            data.error = err.message;
            reject(data);
        }
        else {
            data.task = doc;
            reslove(data);
        }
    });
    return;
}

function updateSimResourceSubStatus(argv, reslove, reject) {
    var index = 0;
    var resource = null;

    logger.info("update sim resource status start ");

    resource = argv.resource;

    for (index = 0; index < resource.report_info.length; index++) {
        if (resource.report_info[index].minor_id === parseInt(argv.task['resource'].minor_id)) {
            break;
        }
    }

    if (index >= resource.report_info.length) {
        logger.info("not found resource. ");
        argv.error = "not found resource";
        reject(argv);
    }
    else {
        if (resource.report_info[index].status !== argv.before) {
            logger.info("resource status is " + resource.report_info[index].status);
            argv.error = "resource status is " + resource.report_info[index].status;
            reject(argv);
        }
        else {
            resource.report_info[index].status = argv.after;
            database.Resource.update({
                    major_id: resource.major_id
                    , "report_info.minor_id": resource.report_info[index].minor_id
                },
                {$set: {"report_info.$.status": resource.report_info[index].status}})
                .exec(function (err) {
                    if (err) {
                        logger.info("resource sim update fail. ", err);
                        argv.error = "resource sim update fail.";
                        reject(argv);
                    }
                    else {
                        argv.task.sub_index = index;
                        argv.task.resource_snapshot = resource.toObject();
                        argv.task.resource_snapshot.sub_index = index;
                        reslove(argv);
                    }
                });
        }
    }
}

function updateRealResourceStatus(argv, reslove, reject) {
    var resource = null;
    var modifyPara = {};

    logger.info("update real resource status start ");

    resource = argv.resource;

    if (resource.report_info[0].status !== argv.before) {
        argv.error = "resource bbu status is " + resource.report_info[0].status;
        logger.info(argv.error);
        reject(argv);
    }
    else {
        for (var subResIndx = 0; subResIndx < resource.report_info.length; subResIndx++) {
            resource.report_info[subResIndx].status = argv.after;
        }

        resource.save(function (err) {
            if (err) {
                logger.info("resource save fail. ", err, resource);
                argv.error = "resource save fail.";
                reject(argv);
            }
            else {
                argv.task.sub_index = 0;
                argv.task.resource_snapshot = resource.toObject();
                reslove(argv);
            }
        });
    }
}

function updateResourceStatus(argv, reslove, reject) {
    var selector = {"major_id": parseInt(argv.task['resource'].major_id)};

    logger.info("update resource status start ");

    database.Resource.findOne(selector)
        .exec(function (err, resource) {
            if (err) {
                logger.info("update resource status error. ", err);
                argv.error = err;
                reject(argv);
            }
            else {
                argv.resource = resource;

                logger.debug("update resource status ok . ", resource);
                if (resource.status === 'lost') {
                    argv.error = 'resource status is lost';
                    reject(argv);
                    return;
                }

                switch (resource.type) {
                    case 'simulation':
                        updateSimResourceSubStatus(argv, reslove, reject);
                        break;
                    case 'real':
                        if (resource.status !== 'lost') {
                            updateRealResourceStatus(argv, reslove, reject);
                        }
                        else {
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

function setResourceStatus(argv, reslove, reject) {
    argv.before = 'idle';
    argv.after = 'busy';

    var resource = argv.resource;

    logger.info("set resource status start ", argv);

    switch (resource.type) {
        case 'simulation':
            updateSimResourceSubStatus(argv, reslove, reject);
            break;
        case 'real':
            if (resource.status !== 'lost') {
                updateRealResourceStatus(argv, reslove, reject);
            }
            else {
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

function failUpdateSimResourceSubStatus(data, reslove, reject) {
    logger.info("fail Update Sim Resource Sub Status start");

    if (data.task && ( data.task['sub_index'] != undefined || data.task.resource_snapshot != undefined)) {
        var resource = data.task.resource_snapshot;
        if (data.task.resource_snapshot) {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot) {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }
        database.Resource.update({
                major_id: resource.major_id
                , "report_info.minor_id": resource.sub_resource[data.task.sub_index].minor_id
            }
            , {$set: {"report_info.$.status": 'idle'}}
            , function (err) {
                if (data.task.resource_snapshot) {
                    data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
                }

                if (data.task.taskgroup_snapshot) {
                    data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
                }

                if (err) {
                    logger.info("fail Update Sim Resource Sub Status. ", err);
                }
                reject(data);
            });
    }
    else {
        reject(data);
    }
}

function failUpdateRealResourceStatus(data, reslove, reject) {
    logger.info("fail Update real Resource Sub Status start");
    if (data.task && (data.task.resource_snapshot != undefined)) {
        var resource = data.task.resource_snapshot;
        if (data.task.resource_snapshot) {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot) {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }

        database.Resource.findOne({major_id: resource.major_id})
            .exec(function (err, obj) {
                if (err) {
                    logger.info("fail Update Sim Resource Sub Status. ", err);
                    reject(data);
                }
                else {
                    obj.report_info.forEach(function (item) {
                        item.status = RESOURCE_STATUS_IDLE;
                    });
                    obj.save(function (err) {
                        if (err)
                            logger.info("fail Update Sim Resource Sub Status. 2", err);

                        if (data.task.resource_snapshot) {
                            data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
                        }

                        if (data.task.taskgroup_snapshot) {
                            data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
                        }

                        reject(data);
                    });
                }
            });
    }
    else {
        reject(data);
    }
}

function failupdateResourceSubStatus(data, reslove, reject) {
    logger.info("fail Update Resource Sub Status start", data);

    switch (data.task.resource_snapshot.type) {
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

function saveTaskRecord(data, reslove, reject) {
    var taskObj = data.task;

    logger.info("create task record start ");

    taskObj.id = taskCurrentIndex++;
    //taskObj.type = new String(task.type).toLowerCase();
    taskObj.status = 'run';
    taskObj.result = 'fail';
    taskObj.run_time = 0;
    // taskObj.fail_message = undefined;
    taskObj.logs = [];

    if (data.task.resource_snapshot) {
        data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
    }

    var taskRecord = new database.TaskRecord(taskObj);
    taskRecord.save(function (err) {
        if (data.task.resource_snapshot) {
            data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
        }

        if (err) {
            logger.info("save task record error. ", err.message);
            logger.info("error : ", err);
            data.error = err.message;
            reject(data);
        }
        else {
            logger.info("save task record success. ");
            reslove(data);
        }
    });
}

function updateTaskRecord(data, reslove, reject) {
    logger.info("update task record start ");

    if (data.task.resource_snapshot) {
        data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
    }

    if (data.task.taskgroup_snapshot) {
        data.task.taskgroup_snapshot.current_index = data.task.sub_index;
        data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
    }

    database.TaskRecord.update({id: data.task.id}, {$set: data.task}, function (err) {
        if (data.task.resource_snapshot) {
            data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot) {
            data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
        }

        if (err) {
            logger.error("update task. ", err);
            data.error = err.message;
            reject(data);
        }
        else {
            reslove(data);
        }
    });
}

function taskFailupdateTaskRecord(data, reslove, reject) {
    logger.info("task fail update task record start ");

    if (data.task && (data.task.id != undefined)) {
        data.task.result = 'fail';
        data.task.status = 'close';
        data.task.fail_message = data.error;
        data.task.logs.push(data.error);

        if (data.task.resource_snapshot) {
            data.task.resource_snapshot = JSON.stringify(data.task.resource_snapshot);
        }

        if (data.task.taskgroup_snapshot) {
            data.task.taskgroup_snapshot.current_index = data.task.sub_index;
            data.task.taskgroup_snapshot = JSON.stringify(data.task.taskgroup_snapshot);
        }

        logger.info("task fail update task record ");
        database.TaskRecord.update({id: data.task.id}, {$set: data.task}, function (err) {
            if (data.task.resource_snapshot) {
                data.task.resource_snapshot = JSON.parse(data.task.resource_snapshot);
            }

            if (data.task.taskgroup_snapshot) {
                data.task.taskgroup_snapshot = JSON.parse(data.task.taskgroup_snapshot);
            }

            if (err) {
                logger.error("update task. ", err);
            }
            reject(data);
        });
    }
    else {
        reject(data);
    }
}

function createXmlRoot(root) {
    var xml = xmlbuilder.create(root, {version: '1.0', encoding: 'UTF-8', standalone: true},
        {pubID: null, sysID: null},
        {
            allowSurrogateChars: false, skipNullAttributes: false,
            headless: false, ignoreDecorators: false, stringify: {}
        });
    return xml;
}

function createTestFrameworkPara(data, reslove, reject) {
    logger.info("run create Test Framework Para start ");

    if (!data.task.test_group) {
        data.error = 'not choice test group.';
        reject(data);
        return;
    }

    database.TestGroup.findOne({name: data.task.test_group}).exec(function (err, testgroup) {
        if (err || !testgroup) {
            logger.error("find test group error. ", err);
            if (err) {
                data.error = err.message;
            }
            else {
                data.error = 'not found test group : \'' + data.task.test_group + '\'';
            }
            reject(data);
        }
        else {
            var root = createXmlRoot('InitConfig');
            root.ele('TaskDriver', {}, 0);
            root.ele('CurEnvironment', {}, '0');
            if (data.task.code_path) {
                root.ele('Compile', {
                    url: data.task.code_path
                    , revision: data.task.revision
                    , svn_user: data.task.svn.user
                    , svn_password: data.task.svn.password
                });
            }
            var testtask = root.ele('TestTask');
            logger.info('test group : ', testgroup);

            var subResource = data.task.resource_snapshot.sub_resource[data.task.sub_index];
            var testgroupname = testgroup.name;
            var testgroupXML = testtask.ele('TestCaseGroup', {name: testgroupname});
            testgroupXML.ele('EnbId', {}, subResource.enbID);

            data.task.taskgroup_snapshot = {name: testgroupname, type: testgroup.type};

            data.task.taskgroup_snapshot.testcase = [];

            testgroup.testcase.forEach(function (item) {
                logger.debug('test case : ', item);
                data.task.taskgroup_snapshot.testcase.push(item);
                testgroupXML.ele('TestCase', {name: item.name, times: 1});
            });

            data.task.taskgroup_snapshot.xml = root.end({pretty: true, indent: '  ', newline: '\n'});

            reslove(data);
        }
    });
}

function createTestCasePara(data, reslove, reject) {
    logger.info("run create Test Case Para start ");

    var subResource = data.task.resource_snapshot.sub_resource[data.task.sub_index];

    var testcaseIDArray = [];

    data.task.taskgroup_snapshot.testcase.forEach(function (item) {
        testcaseIDArray.push(item.id);
    });

    logger.info("testcaseIDArray : ", testcaseIDArray);

    try {
        database.TestCase.find({id: {$in: testcaseIDArray}}).exec(function (err, list) {
            logger.info("err : ", err);
            if (err || !list) {
                logger.error("find test case error. ", err);
                if (err) {
                    data.error = err.message;
                }
                else {
                    data.error = 'not found test case : \'' + data.task.test_group + '\'';
                }
                reject(data);
            }

            logger.debug("list : ", list);

            data.task.taskgroup_snapshot.testcase = {};

            list.forEach(function (testcase) {
                var root = createXmlRoot('TestCase', {
                    name: testcase.name,
                    tcg_name: data.task.taskgroup_snapshot.name
                });

                root.ele('SupportEnvironment', {}, 0);

                logger.debug("test case : ", testcase.name);

                testcase.sequenceOfOpera.forEach(function (atomAction) {
                    logger.debug("test case atom action: ", atomAction.name);
                    var atomActionXml = root.ele('AtomAction', {name: atomAction.name});
                    if (atomAction.name == 'LoadedVersion' && (!data.task.measured_object || !data.task.measured_object.ftp)) {
                        data.error = 'No version was found';
                        reject(data);
                        return;
                    }

                    if (atomAction.name == 'LoadedVersion') {
                        data.loadedVersionFalg = true;
                    }

                    if (atomAction.name == 'EIDetail') {
                        var ei = eiDetail.getEIDetailed();
                        var eiConfig = {};
                        for (var msg in ei) {
                            var atom = atomActionXml.ele('Property', {
                                name: 'msg',
                                'msg': msg,
                                'DspId': ei[msg].DspId,
                                'CoreId': ei[msg].CoreId
                            });
                            for (var key in ei[msg].Tlv) {
                                atom.ele('tlv', {'id': key, 'name': ei[msg].Tlv[key].name});
                            }
                        }
                    }

                    atomAction.argv.forEach(function (arg) {
                        logger.debug("test case atom action Property: ", arg);
                        switch (arg.name) {
                            case 'EnbID':
                                atomActionXml.ele('Property', {name: arg.name, value: subResource.enbID});
                                break;
                            case 'PDNIP':
                                atomActionXml.ele('Property', {name: arg.name, value: subResource.pdnip});
                                break;
                            case 'VersionName':
                                if (atomAction.name == 'LoadedVersion' || atomAction.name == 'CheckVersion') {
                                    atomActionXml.ele('Property', {
                                        name: arg.name,
                                        value: data.task.measured_object.ftp.original
                                    });
                                    break;
                                }
                            case 'Option':
                                if (atomAction.name == 'SetDataBase' || atomAction.name == 'ReConfigEnb') {
                                    try {
                                        var option = new DBSetOptionParse(arg.value);

                                        option.check();

                                        var value = JSON.stringify(option);
                                    } catch (e) {
                                        data.error = 'db option error. ' + e.message;
                                        reject(data);
                                        throw e;
                                    }
                                    atomActionXml.ele('Property', {'name': arg.name, 'value': value});
                                    break;
                                }
                            default:
                                atomActionXml.ele('Property', {name: arg.name, value: arg.value});
                                break;
                        }
                    });
                });
                /**
                 */
                data.task.taskgroup_snapshot.testcase[testcase.name] = root.end({
                    pretty: true,
                    indent: '  ',
                    newline: '\n'
                });
            });

            reslove(data);
        });
    } catch (e) {
        logger.info('error : ', e);
        data.error = e;
        reject(data);
    }
}

function checkTaskPara(data, reslove, reject) {
    if (data.loadedVersionFalg) {
        if (data.task.measured_object.ftp) {
            reslove(data);
        }
        else {
            data.error = "LoadedVersion not found version file.";
            logger.error(data.error);
            reject(data);
        }
    }
    else {
        reslove(data);
    }
}

function sendTaskToSlave(data, reslove, reject) {
    logger.info('send Task To Slave start');
    slaveManger.getSlaveByID(data.task['resource'].major_id, function (err, slave) {
        if (err || !slave) {
            data.error = 'not found slave (' + data.task['resource'].major_id + ')';
            reject(data);
        }
        else {
            if (slave.type === 'real' && data.task.taskgroup_snapshot.type === 'simulation') {
                logger.info('slave is real, but test group is simulation.');
                data.error = 'slave is real, but test group is simulation.';
                reject(data);
                return;
            }

            var options = {
                port: slave.port,
                hostname: slave.ip,
                method: 'POST',
                path: '/slave/task',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };

            logger.info("send http request opt : ", options);

            sendHttpRequest(options, JSON.stringify(data.task), function (err, res, chunk) {
                if (err) {
                    logger.info('send http request error.', err);
                    data.error = err;
                    reject(data);
                }
                else {
                    var result = JSON.parse(chunk);
                    if (result.result != SUCCESS) {
                        data.error = 'slave response error.'
                        reject(data)
                    }
                    else {
                        reslove(data);
                    }
                }
            });
        }
    });
}

function getCacheLog(data, reslove, reject) {
    logger.info("run get Cache Log start ");

    redis.lrange(data.task.cache_key, 0, -1, function (err, result) {
        if (err || !result) {
            data.error = err;
            reject(data);
        }
        else {
            data.task.logs = [];

            var atomPatt = new RegExp('^run Atom\w+ result : False\n$', 'g');
            var patt = new RegExp('^group ' + data.task.test_group + ' run result: (False|True)\n$', 'g');
            var patt2 = new RegExp(' (False|True)\n$', 'g');

            for (var index in result) {
                var message = JSON.parse(result[index]).message;

                data.task.logs.push(message);

                var atomFailMessage = message.match(atomPatt);
                if (atomFailMessage && atomFailMessage.length > 0) {
                    data.task.fail_message = message;
                }
                else {
                    var matchResult = message.match(patt);
                    if (matchResult && matchResult.length > 0) {
                        if (message.match(patt2)[0] === ' False\n') {
                            data.task.result = 'fail';
                        }
                        else {
                            data.task.result = 'success';
                        }
                    }
                }
            }

            reslove(data);
        }
    });
}

function delCacheLog(data, reslove, reject) {
    logger.info("run del Cache Log start ");

    redis.del(data.task.cache_key, function (err) {
        if (err) {
            data.error = err;
            reject(data);
        }
        else {
            reslove(data);
        }
    });
}

function delStepLog(data, reslove, reject) {
    logger.info("run del step Log start ");

    redis.del(data.task.cache_key + '.step', function (err) {
        if (err) {
            data.error = err;
            reject(data);
        }
        else {
            reslove(data);
        }
    });
}

function getEiBasicLog(data, reslove, reject) {
    logger.info("run get ei basic Log start ");

    redisEI.lrange(data.task.cache_key, 0, -1, function (err, result) {
        if (err || !result) {
            data.error = err;
            reject(data);
        }
        else {
            data.task.ei_basic = [];

            for (var index in result) {
                var message = JSON.parse(result[index]);

                data.task.ei_basic.push(message);
            }

            logger.info("get ei basic Log count :", data.task.ei_basic.length);

            reslove(data);
        }
    });
}

function delEiBasicLog(data, reslove, reject) {
    logger.info("run del ei basic Log start ");

    redisEI.del(data.task.cache_key, function (err) {
        if (err) {
            data.error = err;
            reject(data);
        }
        else {
            reslove(data);
        }
    });
}

function notifyView(data, reslove, reject) {
    logger.info("notify view start ");

    if (!data.callAsync) {
        data.callAsync = true;
        data.async(data.error, data.task);
    }

    if (data.error) {
        reject(data);
    }
    else {
        reslove(data);
    }
}

function setDataStatus(data, reslove, reject) {
    data.before = 'busy';
    data.after = 'idle';

    if (data.error) {
        reject(data);
    }
    else {
        reslove(data);
    }
}

function closeTask(data, reslove, reject) {
    data.task.status = 'close';
    reslove(data);
}

function checkCITaskCache() {
    logger.info("check CI Task Cache start");

    redis.pipeline().lpop('ci_task_cache').exec(function (err, result) {
        if (err) {
            logger.info("check CI Task Cache err", err);
        }
        else if (result[0] && result[0][0]) {
            rerunAutoTask(JSON.parse(result[0][0]));
        }
    });
}

function cacheCITask(data, reslove, reject) {
    logger.info("cache CI task");

    if (data.original_id) {
        data.task.original_id = data.original_id;
    }

    redis.pipeline().rpush('ci_task_cache', JSON.stringify(data.task)).exec(function (err, result) {
        if (err) logger.error(err);
        reject(data);
    });
}

function chooseSimResource(data, reslove, reject) {
    logger.info("run choose simulation resource start ");
    database.Resource.find({
        "type": "simulation",
        "report_info.resource_type": "auto",
        "report_info.status": "idle"
    }).exec(function (err, list) {
        if (err) {
            logger.info("not find idle simulation resource", err);
            data.error = err;
            reject(data);
        }
        else if (!list || list.length == 0) {
            logger.info("not find idle simulation resource, cache task", list);
            data.error = "not find idle simulation resource, cache task";
            reject(data);
        }
        else {
            var resource = undefined;
            list[0].report_info.forEach(function (item) {
                if (resource == undefined && item.status == 'idle') {
                    resource = item;
                }
            });
            data.task['resource'] = {major_id: list[0].major_id, minor_id: resource.minor_id};
            data.resource = list[0];
            reslove(data);
        }
    });
}

function chooseRealResource(data, reslove, reject) {
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

function chooseResource(data, reslove, reject) {
    logger.info("run choose resource start ");

    if (data.task.type === 'real') {
        chooseRealResource(data, reslove, reject);
    }
    else if (data.task.type === 'simulation') {
        chooseSimResource(data, reslove, reject)
    }
    else {
        logger.info("not find task type!", err);
        data.error = err;
        reject(data);
    }
}

function chooseTestGroup(data, reslove, reject) {
    logger.info("run choose Test Group start ");
    database.CIConfig.find({type: data.task.type, env_type: data.task.env_type})
        .exec(function (err, list) {
            if (err) {
                data.error = err;
                reject(data);
            }
            else if (!list || list.length == 0) {
                data.error = 'not found ci config';
                reject(data);
            }
            else {
                data.ciConfig = list[0].toObject();
                data.task.test_group = list[0].test_group;

                if (data.task.type === 'real') {
                    data.task.user = list[0].Another_Name;
                }

                data.task.ciConfig = data.ciConfig;
                reslove(data);
            }
        });
}

function getCommitUser(data, reslove, reject) {
    if (data.task.type !== 'simulation') {
        reslove(data);
        return;
    }

    var para = ['log', '--xml'];

    logger.info("run get Commit User start ");

    para.push('--username');
    para.push(data.ciConfig.svn_user);
    para.push('--password');
    para.push(data.ciConfig.svn_password);
    para.push('--no-auth-cache');
    para.push('-r');
    para.push(data.task.revision);
    para.push(data.task.code_path);

    var child = child_process.spawn('svn', para);

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    var stdoutBuff = "";
    var stderrBuff = "";
    child.stdout.on('data', function (message) {
        logger.info('stdout : ' + message);
        stdoutBuff += message;
    });

    child.stderr.on('data', function (message) {
        logger.error('stderr : ' + message);
        stderrBuff += message;
    });

    child.on('close', function (code, signal) {
        if (code != 0) {
            data.error = "get commit user fail";
            reject(data);
        }
        else {
            parseString(stdoutBuff, function (err, result) {
                if (err) {
                    data.error = "get commit user fail. parse xml";
                    reject(data);
                }
                else {
                    if (result.log && result.log.logentry && result.log.logentry[0].author) {
                        data.task.user = result.log.logentry[0].author[0];
                        reslove(data);
                    }
                    else {
                        data.error = "revision or code path error. not get commit user";
                        reject(data);
                    }
                }
            });
        }
    });
}

function createTask(task, callback) {
    var taskObj = {};
    mqUtil.sendRequestByRPC("create task", task ,config.gatewayAmqp.taskQueue);
    for (var key in task) {
        taskObj[key] = task[key];
    }

    logger.info("create task start ");
    /**
     * updateResourceStatus
     */
    makePromise(updateResourceStatus, {before: 'idle', after: 'busy', task: taskObj, async: callback})
        .then(makePromiseFunction(setDataStatus), makePromiseFunction(setDataStatus))
        .then(makePromiseFunction(saveTaskRecord), defaultErrorProcess)
        .then(makePromiseFunction(notifyView), makePromiseFunction(notifyView))
        .then(makePromiseFunction(createTestFrameworkPara), defaultErrorProcess)
        .then(makePromiseFunction(createTestCasePara), defaultErrorProcess)
        .then(makePromiseFunction(checkTaskPara), defaultErrorProcess)

        .then(makePromiseFunction(sendTaskToSlave), defaultErrorProcess)

        .then(makePromiseFunction(updateTaskRecord), defaultErrorProcess)
        .then(defaultProcess, makePromiseFunction(taskFailupdateTaskRecord))
        .then(defaultProcess, makePromiseFunction(failupdateResourceSubStatus))
        .done(function (data) {
            logger.info('test task complete. result : ', data.task.result);
        }, function (data) {
            logger.info("done function. data : ", data.error ? data.error : data);
            if (data.task && data.task.task_type == 'auto') {
                redis.pipeline().rpush('ci_task_cache', JSON.stringify(data.task)).exec(function (err, result) {
                    if (err) logger.error(err);
                });
            }
        }, undefined);

    return;
}

function taskReport(data, callback) {
    mqUtil.sendRequestByRPC("report task", data ,config.gatewayAmqp.taskQueue);
    makePromise(updateTaskRecord, {task: data})
        .done(function (data) {
            logger.info('test task complete. result : ', data.task.result);
            callback(null);
        }, function (data) {
            logger.info("done function. data : ", data.error ? data.error : data);
            callback(data.error);
        }, undefined);
}

function taskResult(taskObj, callback) {
    mqUtil.sendRequestByRPC("result task", taskObj ,config.gatewayAmqp.taskQueue);
    makePromise(notifyView, {before: 'busy', after: 'idle', task: taskObj, async: callback})
        .then(makePromiseFunction(getCacheLog), defaultErrorProcess)
        .then(makePromiseFunction(delCacheLog), defaultErrorProcess)
        .then(makePromiseFunction(delStepLog), defaultErrorProcess)
        .then(makePromiseFunction(getEiBasicLog), defaultErrorProcess)
        .then(makePromiseFunction(delEiBasicLog), defaultErrorProcess)
        .then(makePromiseFunction(closeTask), defaultErrorProcess)
        .then(makePromiseFunction(manualTaskResult), defaultErrorProcess)
        .then(makePromiseFunction(updateTaskRecord), makePromiseFunction(taskFailupdateTaskRecord))
        .then(makePromiseFunction(updateResourceStatus), makePromiseFunction(failupdateResourceSubStatus))
        .then(makePromiseFunction(autoTaskResult), makePromiseFunction(autoTaskResult))
        .done(function (data) {
            logger.info('test task complete. result : ', data.task.result);
        }, function (data) {
            logger.info("done function. data : ", data.error ? data.error : data);
        }, undefined);
}

function manualTaskResult(data, reslove, reject) {
    if (data.task.type === 'simulation') {
        reslove(data);
        return;
    }

    if (TaskRecordStory[data.task.id]) {
        reslove(data);
        return;
    }

    logger.info("manual task result ");

    var taskInfo = data.task;

    makePromise(generateRealImage, {task: taskInfo, result_data: data})
        .done(function (result) {
            reslove(data);
            logger.info('create manual task complete. result : ', result.task.result);
        }, function (result) {
            reject(data);
            logger.info('done create manual task error function. data : ', result.error ? result.error : result);
        }, undefined);
}

var mail = undefined;

function getRerunTaskInfo(data, reslove, reject) {
    logger.info("get rerun task info");

    database.TaskRecord.findOne({id: data.original_id}, function (err, task) {
        if (err || !task) {
            data.error = 'err :' + err + ' task : ' + task;
            reject(data);
        }
        else {
            logger.info(task);
            data.original_task = task;
            reslove(data);
        }
    });
}

function getCIResult(data, reslove, reject) {
    logger.info('get CI Result start');

    data.mailContext.subject = 'Cloud CI Build #' + data.task.id + ' - ' + data.task.result;
    data.mailContext.to = [data.task.user + '@bj.xinwei.com.cn'];

    if (data.task.ciConfig && data.task.ciConfig.email_notify.length > 0) {
        data.mailContext.cc = data.task.ciConfig.email_notify;
    }
    else {
        data.mailContext.cc = ['quleixing@bj.xinwei.com.cn'
            , 'liujinxing@bj.xinwei.com.cn'
            , 'xiaoxu@bj.xinwei.com.cn'
            , 'guowei@bj.xinwei.com.cn'];
    }

    try {
        var obj = AllUserList[data.task.user];
        LeaderList[obj.group].forEach(function (mem) {
            data.mailContext.cc.push(mem.email);
        });
    } catch (e) {
        logger.error('get LeaderList error.', e.message, util.inspect(AllUserList, {showHidden: true, depth: null}))
    }

    var rkey = data.task.id + '.ci_report';
    redis.pipeline().get(rkey).del(rkey)
        .exec(function (err, list) {
            if (err) {
                logger.error(err);
                data.error = err;
                reject(data);
            }
            else {
                var urlLink = 'http://' + config.web_server.ip + ':' + config.web_server.port + '/TaskInfo.html?ResType=auto&TaskId=' + data.task.id;
                if (list[0][1]) {
                    logger.info(list);
                    data.ci_result = list[0][1].replace('{result_url}', urlLink);
                }
                else {
                    data.ci_result = ['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                        '<html xmlns="http://www.w3.org/1999/xhtml">',
                        '<head>',
                        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
                        '<title>CompileResult</title>',
                        '<STYLE type="text/css">',

                        'body{font-family:Consolas,Microsoft Yahei}',
                        'table,td,tr,th{font-size:12px;}',
                        'table{ margin:0 auto;}',
                        '.common{align:center; text-align:left; margin-bottom:20px; border-top:1px solid #d8d8d8; border-left:1px solid #d8d8d8;}',
                        '.common th{ line-height:20px; font-weight:normal; background-color:#AFD7FF; border-right:1px solid #d8d8d8; border-bottom:1px solid #d8d8d8;}',
                        '.common td{ padding:5px 3px; line-height:16px; border-right:1px solid #d8d8d8; border-bottom:1px solid #d8d8d8;}',
                        '.common td{ line-height:16px;}',

                        '.bluebar{ height:4px; line-height:4px; overflow:hidden; background-color:#2f9ae0;}',
                        '.list_dl{ overflow:hidden; _display:inline-block; border:1px solid #cbddeb; border-bottom:0;}',
                        '.last_dl{ border-bottom:1px solid #cbddeb; white-space:nowrap;}',
                        '.list_dl dt{ width:578px; height:38px; line-height:40px; overflow:hidden; padding-left:50px; float:left; font-size:14px;}',
                        '.list_dl dd{ width:130px; height:31px; line-height:14px; padding-top:7px; float:left; color:#999999; overflow:hidden;}',
                        '.list_dl dd.cli_dd{ width:70px;}',
                        '.list_dl dd span{ display:block;}',

                        '.list_dl dt.tiline{ width:908px; height:24px; line-height:24px; background-color:#f0f9fe; color:#333333; font-weight:bold; font-size:12px;}',
                        'dl.bluebg{ height:38px; line-height:38px; padding-top:0; background-color:#f0f9fe; color:#333333;}',
                        'dl.bluebg dd{ height:38px; line-height:38px; padding-top:0; color:#333333;}',

                        '</STYLE>',
                        '</head>',
                        '<body>',
                        '<table width=\"90%\" class = \"common\">',
                        '<tr><th>ERROR</th></tr>',
                        '<tr><td>error information see ' + urlLink + '</td></tr>',
                        '<tr><th>Powered by CloudTestPlatform</tr></th></table></body> </html>'].join('\n');
                }

                data.mailContext.text = data.ci_result;
                data.mailContext.html = data.ci_result;

                reslove(data);
            }
        });
}

function updateCIStatus(data, reslove, reject) {
    logger.info('Update CI Status start');

    if (data.task.result == 'success') {
        var branche = url.parse(data.task.code_path).path.split('/');
        var branch = null;
        for (var i = 0; i < branche.length; i++) {
            if (branche[i] == 'branches') {
                branch = branche[i + 1];
                break;
            }
        }

        logger.info('revision : ', data.task.revision, ' branch : ', branch);

        ci_database.query('update ci_info set is_ci_passed = 1 where revision <= ? and branch = ?', [data.task.revision, branch], function (err, result) {
            if (err) {
                data.error = err;
                logger.error('update ci_info error', err);
                reject(data);
            }
            else {
                logger.info('change ci_info ' + result.affectedRows + ' rows');
                reslove(data);
            }
        });
    }
    else {
        if (data.error) {
            reject(data);
        }
        else {
            reslove(data);
        }
    }
}

function sendCIMail(data, reslove, reject) {
    logger.info('Send CI Mail start');

    logger.info('mail context', data.mailContext)
    mail.sendMail(data.mailContext, function (err) {
        if (err) {
            logger.error(err);
            data.error = err;
            reject(data);
        }
        else {
            logger.info(data.mailContext);
            reslove(data);
        }
    });
}

function runNormalTask(data, reslove, reject) {
    logger.info('run normal task');

    data.task.svn = {user: data.ciConfig.svn_user, password: data.ciConfig.svn_password};
    var taskObj = {};

    for (var key in data.task) {
        taskObj[key] = data.task[key];
    }

    logger.info("create task start ");

    makePromise(setDataStatus, {task: taskObj, async: data.async})
        .then(makePromiseFunction(saveTaskRecord), defaultErrorProcess)
        .then(makePromiseFunction(notifyView), makePromiseFunction(notifyView))
        .then(makePromiseFunction(createTestFrameworkPara), defaultErrorProcess)
        .then(makePromiseFunction(createTestCasePara), defaultErrorProcess)
        .then(makePromiseFunction(checkTaskPara), defaultErrorProcess)

        .then(makePromiseFunction(sendTaskToSlave), defaultErrorProcess)

        .then(makePromiseFunction(updateTaskRecord), defaultErrorProcess)
        .then(defaultProcess, makePromiseFunction(taskFailupdateTaskRecord))
        .then(defaultProcess, makePromiseFunction(failupdateResourceSubStatus))
        .done(function (result) {
            data.task = result.task;
            logger.info('test task complete. result : ', result.task.result);
            data.new_task_id = result.task.id;
            reslove(data);
        }, function (result) {
            logger.info("done function. data : ", result.error ? result.error : data);
            if (result.task && result.task.task_type == 'auto') {
                redis.pipeline().rpush('ci_task_cache', JSON.stringify(data.task)).exec(function (err, result) {
                    if (err) logger.error(err);
                });
            }
            data.task = result.task;
            data.error = 'err : ' + err + ' data : ' + data.task;
            logger.error(data.error);
            reject(data);
        }, undefined);

    return;
}

function updateOriginalTask(data, reslove, reject) {
    logger.info('update original task');
    logger.debug(data.original_task);

    if (data.original_task) {
        logger.info('real update original task old ', data.original_task.id, data.new_task_id);

        data.original_task.rerun_id = data.new_task_id;
        data.original_task.save(function (err) {
            if (err) {
                logger.error(err);
                date.error = err;
                reject(data);
            }
            else {
                reslove(data);
            }
        });
    }
    else {
        reslove(data);
    }
}

function generateRealImage(data, reslove, reject) {
    logger.info("run generate real image. type is ", data.task.type);

    if (data.task.type === 'simulation') {
        reslove(data);
        return;
    }

    logger.debug(util.inspect(data, {showHidden: true, depth: null}));
    logger.debug(util.inspect(config.master.static_page_path, {showHidden: true, depth: null}));
    logger.debug(util.inspect(data.task, {showHidden: true, depth: null}));
    logger.debug(util.inspect(data.task.id, {showHidden: true, depth: null}));
    var task_id = data.task.id;

    var EIData = JSON.stringify(data.result_data.task.ei_basic);
    var para = ['EIBaseDraw.py', config.master.static_page_path + '/task/' + task_id];

    logger.debug("EIData", EIData);

    if (!EIData || EIData.length <= 0) {
        data.error = "not ei baise data";
        logger.error(data.error);
        reject(data);
        return;
    }

    var child = child_process.spawn('python', para);

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdin.write(EIData + "\n");

    var stdoutBuff = "";
    var stderrBuff = "";
    child.stdout.on('data', function (message) {
        logger.info('stdout : ' + message);
        stdoutBuff += message;
    });

    child.stderr.on('data', function (message) {
        logger.error('stderr : ' + message);
        stderrBuff += message;
    });

    child.on('close', function (code, signal) {
        if (code != 0) {
            data.error = "generate image fail";
            data.full_task_info = data.task;
            reject(data);
        }
        else {
            urlPrefix = 'http://' + config.web_server.ip + ':' + config.web_server.port + '/task/' + task_id + '/';
            var imageList = ['DlAvgMcs', 'DlFlowRate', 'DlAvgBler', 'UlAvgMcs', 'UlFlowRate', 'UlAvgBler'];
            data.task.ei_basic_image = [];

            imageList.forEach(function (item, i) {
                data.task.ei_basic_image[i] = {name: item, url: urlPrefix + item + '.png'};
            });

            data.full_task_info = data.task;
            data.task = {id: data.full_task_info.id, ei_basic_image: data.full_task_info.ei_basic_image};

            logger.info("generate real image. ", data.task);

            reslove(data);
        }
    });
}

function autoTaskCompletionProcess(data, reslove, reject) {
    logger.debug('data task', data.task);

    if (data.task.ei_basic_image) {
        data.full_task_info.ei_basic_image = data.task.ei_basic_image;
    }
    data.task = data.full_task_info;

    logger.info("auto Task Completion Process. task type ", data.task.type, data.error);

    if (data.task.type !== 'real') {
        reslove(data);
        return;
    }

    logger.info("task ", data.task);

    //python -u conf_VerInfo.py 1015 V3.1.7.0T1873 Cloud_Real_CI SUCCESS
    var para = ['-u', 'conf_VerInfo.py', data.task.id];

    var patt = /^McLTE\.(\S+)\.BIN$/
    patt.compile(patt);
    var version = patt.exec(data.task.measured_object.ftp.original);
    if (version) {
        version = "V" + version[1];
    }
    else {
        data.error = "not match version info";
        logger.error(data.error, data.task.measured_object);
        reject(data);
        return;
    }

    para.push(version);

    para.push('Cloud_Real_CI');

    if (data.task.result === 'success') {
        para.push('SUCCESS');
    }
    else {
        para.push('FAILED');
    }

    logger.info("command is python ", para);

    var child = child_process.spawn('python', para, {cwd: config.master.completion_extend_path});

    child.stdout.on('data', function (message) {
        logger.info('stdout : ' + message);
    });

    child.stderr.on('data', function (message) {
        logger.error('stderr : ' + message);
    });

    child.on('close', function (code, signal) {
        if (code != 0) {
            data.error = "auto Task Completion Process fail";
            logger.error(error);
            reject(data);
        }
        else {
            logger.info("auto Task Completion Process success. ");
            reslove(data);
        }
    });
}

function createAutoTask(task, callback) {
    mqUtil.sendRequestByRPC("create auto task", task ,config.gatewayAmqp.taskQueue);
    //rerunAutoTask(task, callback);
}

var TaskRecordStory = {};

function rerunAutoTask(task, callback) {
    mqUtil.sendRequestByRPC("rerun auto task", task ,config.gatewayAmqp.taskQueue);
    var taskObj = {};

    logger.info("rerun auto task start ");

    var promise = undefined;

    logger.info(task, util.isNumber(task));

    if (util.isNumber(task)) {
        logger.info("rerun auto task start ");
        promise = makePromise(getRerunTaskInfo, {original_id: task, 'task': {task_type: 'auto'}, async: callback})
            .then(makePromiseFunction(chooseResource), defaultErrorProcess)
            .then(makePromiseFunction(setResourceStatus), defaultErrorProcess);
    }
    else if (task.original_id) {
        logger.info("rerun auto task start ", task);

        task.task_type = 'auto';

        promise = makePromise(getRerunTaskInfo, {original_id: task.original_id, 'task': task, async: callback})
            .then(makePromiseFunction(chooseResource), defaultErrorProcess)
            .then(makePromiseFunction(setResourceStatus), defaultErrorProcess);
    }
    else if (task.task && task.task.original_id) {
        logger.info("rerun auto task start ", task);

        task.task_type = 'auto';

        promise = makePromise(getRerunTaskInfo, {
            original_id: task.task.original_id,
            'task': task.task,
            async: callback
        })
            .then(makePromiseFunction(chooseResource), defaultErrorProcess)
            .then(makePromiseFunction(setResourceStatus), defaultErrorProcess);
    }
    else {
        logger.info("create auto task start ");

        var taskObj = {};

        for (var key in task) {
            taskObj[key] = task[key];
        }

        taskObj.task_type = 'auto';

        promise = makePromise(chooseResource, {'task': taskObj, async: callback})
            .then(makePromiseFunction(setResourceStatus), defaultErrorProcess)
    }

    promise.then(makePromiseFunction(chooseTestGroup), makePromiseFunction(cacheCITask))
        .then(makePromiseFunction(getCommitUser), defaultErrorProcess)
        .then(defaultProcess, makePromiseFunction(failupdateResourceSubStatus))
        .then(makePromiseFunction(runNormalTask), defaultErrorProcess)
        .then(makePromiseFunction(updateOriginalTask), defaultErrorProcess)
        .done(function (data) {
            TaskRecordStory[data.task.id] = {
                task_type: 'auto'
                , type: data.task.type
                , user: data.task.user
                , code_path: data.task.code_path
                , revision: data.task.revision
                , ciConfig: data.ciConfig
                , bin_file: data.task.bin_file
                , measured_object: data.task.measured_object
            };
            logger.info('test auto task complete. id : ', data.task.id);
        }, function (data) {
            logger.info("done error function. data : ", data.error ? data.error : data);
            callback(data.error, null);
        }, undefined);
}

function autoTaskResult(data, reslove, reject) {
    logger.info("auto task result start ", data.task.task_type == 'auto', data);
    var taskInfo = data.task;
    logger.debug(util.inspect(data.task, {showHidden: true, depth: null}));

    if (TaskRecordStory[data.task.id] && TaskRecordStory[data.task.id].task_type == 'auto') {
        var promise = undefined;
        var task_type = TaskRecordStory[data.task.id].type;

        taskInfo.type = TaskRecordStory[data.task.id].type;
        taskInfo.task_type = TaskRecordStory[data.task.id].task_type;
        taskInfo.user = TaskRecordStory[data.task.id].user;
        taskInfo.code_path = TaskRecordStory[data.task.id].code_path;
        taskInfo.revision = TaskRecordStory[data.task.id].revision;
        taskInfo.ciConfig = TaskRecordStory[data.task.id].ciConfig;
        taskInfo.bin_file = TaskRecordStory[data.task.id].bin_file;
        taskInfo.measured_object = TaskRecordStory[data.task.id].measured_object;

        delete TaskRecordStory[data.task.id];

        logger.info("task_type is auto. run env is ", task_type);

        taskInfo.result = data.task.result;

        if (task_type === 'simulation') {
            logger.info("simulation run task result ");
            promise = makePromise(getCIResult, {
                task: taskInfo,
                mailContext: {
                    from: "linux_CI_auto <guowei@bj.xinwei.com.cn>",
                    to: [], cc: [], subject: "", text: "", html: ""
                }
            })
                .then(makePromiseFunction(updateCIStatus), makePromiseFunction(updateCIStatus))
                .then(makePromiseFunction(sendCIMail), makePromiseFunction(sendCIMail));
        }
        else if (task_type === 'real') {
            if (util.isArray(data.task.ei_basic)) {
                logger.info("real run task result. ei basic length :", data.task.ei_basic.length);
            }
            else {
                logger.info("real run task result. ei basic length : 0");
            }
            promise = makePromise(generateRealImage, {task: taskInfo, result_data: data})
                .then(makePromiseFunction(updateTaskRecord), defaultErrorProcess)
                .then(makePromiseFunction(autoTaskCompletionProcess), makePromiseFunction(autoTaskCompletionProcess));
        }

        promise.then(defaultProcess, defaultErrorProcess)  //留给执行脚本使用
            .done(function (result) {
                reslove(data);
                logger.info('create auto task complete. result : ', result.task.result);
            }, function (result) {
                reject(data);
                logger.info('done create auto task error function. data : ', result.error ? result.error : result);
            }, undefined);
    }
    else {
        logger.info("task_type is manual");
        reslove(data);
    }

    checkCITaskCache();
}

module.exports = function (db, mqutil) {
    database = db;
    mqUtil = mqutil;
    slaveManger = new slave_manage(db, mqutil);
    eiDetail = new ei_Detail(db, mqutil);
    db.TaskRecord.find({}).select({id: 1}).sort({id: -1}).limit(1)
        .exec(function (err, list) {
            if (list.length == 0 || (list[0].id == undefined)) {
                taskCurrentIndex = 1;
            }
            else {
                taskCurrentIndex = list[0].id + 1;
            }
            logger.info('task index = ', taskCurrentIndex);
        });

    mail = new Mail();

    ci_database = mysql.createPool(config.ci_database);
    ci_database.on('enqueue', function () {
        logger.error('Waiting for available connection slot');
    });

    return {
        'getTask': getTask,
        'createTask': createTask,
        'taskReport': taskReport,
        'taskResult': taskResult,
        'createAutoTask': createAutoTask,
        'rerunAutoTask': rerunAutoTask,
    };
};