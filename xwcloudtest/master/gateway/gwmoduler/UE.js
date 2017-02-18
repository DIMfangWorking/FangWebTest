//var mongoose = require('mongoose');
var Redis = require('ioredis');

var redis = new Redis({port:config.cache.port, host:config.cache.ip, db:1});

var database = undefined;
var messageQueue = undefined;
var UeMap = {};
var timer = undefined;
var mqUtil;

function slaveue_timeout()
{
    if (timer)
        clearTimeout(timer);
    timer = setTimeout(function (){
        redis.flushdb();
    }, 20 * 1000);
}

function UEOnline(ue, callback)
{
    UeMap[ue.IMSI] = ue;
    mqUtil.sendRequestByRPC("UE-Online", ue, config.gatewayAmqp.resourceQueue);
    logger.info("ue online ", ue);
    key = "enb." + ue.enb;
    cell = "cell."+ue.cell;
    redis.pipeline().hset(ue.IMSI+'.info', 'enb', ue.enb)
                .hset(ue.IMSI+'.info', 'cell', ue.cell)
                .hset(ue.IMSI+'.info', 'ip', ue.ip)
                .hset(ue.IMSI+'.info', 'pci', ue.pci)
                .hset(key, cell, 1)
                .hset(key, cell + '.' + ue.IMSI, 1).exec(function(err){
        callback(err, null);
    });
}

function UEOffline(ue, callback)
{
    logger.info("ue offline ", ue);
    mqUtil.sendRequestByRPC("UE-Offline", ue, config.gatewayAmqp.resourceQueue);
    key = "enb." + ue.enb;
    cell = "cell."+ue.cell;
    redis.pipeline().hget(ue.IMSI+'.info', 'enb')
                .hget(ue.IMSI+'.info', 'cell')
                .del(ue.IMSI+'.thr')
                .del(ue.IMSI+'.info').exec(function(err, results){
        // [ [ null, '134' ], [ null, '1' ], [ null, 0 ], [ null, 1 ] ]
        logger.info('result = ', results);
        var enbid = results[0][1];
        var cellid = results[0][1];
        redis.pipeline().hdel('enb.'+ enbid, cellid + '.' + ue.IMSI).exec(function(err, results){});
        callback(err, null);
        delete UeMap[ue.IMSI];
    });
}

function UEBandwitdth(thr, callback)
{
    logger.debug("ue Bandwitdth ", thr);
    mqUtil.sendRequestByRPC("UE-Bandwitdth", thr, config.gatewayAmqp.resourceQueue);
    imsi = thr.IMSI;
    delete thr['IMSI'];
    redis.pipeline().rpush(imsi+'.thr', JSON.stringify(thr)).exec(function(err){
        callback(err, null);
    });
}
module.exports = function (db, mqutil) {
    database = db;
    mqUtil = mqutil;
    return {
        'UEOnline' : UEOnline,
        'UEOffline' : UEOffline,
        'UEBandwitdth' : UEBandwitdth
    };
}