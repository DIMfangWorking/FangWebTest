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

function createTask(task, callback) {
    mqUtil.sendRequestByRPC("create task", task, config.gatewayAmqp.taskQueue, callback);

}

function taskReport(data, callback) {
    mqUtil.sendRequestByRPC("report task", data, config.gatewayAmqp.taskQueue, callback);

}

function taskResult(taskObj, callback) {
    mqUtil.sendRequestByRPC("result task", taskObj, config.gatewayAmqp.taskQueue, callback);
}


function createAutoTask(task, callback) {
    mqUtil.sendRequestByRPC("create auto task", task, config.gatewayAmqp.taskQueue, callback);

}

function rerunAutoTask(task, callback) {
    mqUtil.sendRequestByRPC("rerun auto task", task, config.gatewayAmqp.taskQueue, callback);
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
        'createTask': createTask,
        'taskReport': taskReport,
        'taskResult': taskResult,
        'createAutoTask': createAutoTask,
        'rerunAutoTask': rerunAutoTask,
    };
};