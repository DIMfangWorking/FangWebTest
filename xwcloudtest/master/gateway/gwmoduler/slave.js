var util = require('util');
var EventEmitter = require('events');

var Redis = require('ioredis');

var redis = new Redis({port: config.cache.port, host: config.cache.ip, db: 3});
var mqUtil;
// Object.prototype.Clone = function(){
//     var objClone;
//     if (this.constructor == Object){
//         objClone = new this.constructor(); 
//     }else{
//         objClone = new this.constructor(this.valueOf()); 
//     }
//     for(var key in this){
//         if ( objClone[key] != this[key] ){ 
//             if ( typeof(this[key]) == 'object' ){ 
//                 objClone[key] = this[key].Clone();
//             }else{
//                 objClone[key] = this[key];
//             }
//         }
//     }
//     objClone.toString = this.toString;
//     objClone.valueOf = this.valueOf;
//     return objClone; 
// }

function SlaveModule(db, mqutil) {
    if (SlaveModule.unique !== undefined) {
        return SlaveModule.unique;
    }
    mqUtil = mqutil;

    var database = db;
    var SlaveStore = {};
    var currentIndex = undefined;

    EventEmitter.call(this);

    db.Resource.find({}).select({major_id: 1})
        .sort({major_id: -1}).limit(1).exec(function (err, list) {
        if (list.length == 0 || (list[0].major_id == undefined)) {
            currentIndex = 1;
        }
        else {
            currentIndex = list[0].major_id + 1;
        }
        logger.info('resource index = ', currentIndex);
    });

    this.saveSlave = function (slave, callback) {
        var result = database.Resource.find({ip: slave.ip, port: slave.port});

        return;
    };

    function SlaveLostTimeout(id) {
        var selecter = undefined;
        var update = undefined;

        logger.error("slave lost. ip : ", SlaveStore[id].ip);

        database.Resource.findOne({major_id: id}).exec(function (err, docs) {
            if (err)
                logger.error("set slave status error.", err);

            docs.report_info.forEach(function (item) {
                item.status = STATUS_LOST;
            });

            docs.status = STATUS_LOST;
            docs.save(function (err) {
                if (err) logger.error(err);
            });
            logger.info("set slave(%d) status lost.", id);
        });

        database.TaskRecord.update({"resource.major_id": id, status: TASK_STATUS_RUN}
            , {$set: {status: TASK_STATUS_CLOSE, fail_message: 'slave lost'}}
            , {multi: true}).exec(function (err, raw) {
            if (err)
                logger.error("set slave status error.", err);
            logger.info("set slave(%d) task status close.", id, raw);
        });

        SlaveModule.unique.emit("offline", SlaveStore[id]);

        delete SlaveStore[id];
    };

    function replaceSlaveInfo(obj, slave) {
        obj.cpu = slave.cpu;
        obj.mem = slave.mem;
        obj.uptime = slave.uptime;
        obj.hostname = slave.hostname;
        obj.platfrom = slave.platfrom;
        obj.status = slave.status;
        obj.cpu = slave.cpu;
        obj.port = slave.port;

        var sub_resource = obj.sub_resource;
        delete obj.sub_resource;
        delete slave.sub_resource;

        if (obj.type === 'real') {
            var device = slave.device;
            var pdnip = '';
            try {
                pdnip = sub_resource[0].pdnip;
            } catch (e) {
                pdnip = '';
            }

            obj.report_info[0] = {minor_id: 1, name: 'bbu'};

            obj.report_info[0].status = device.bbu.status;
            obj.report_info[0].ip = device.bbu.ip;
            obj.report_info[0].epcip = device.bbu.au8DstIP1;
            obj.report_info[0].pdnip = pdnip;
            obj.report_info[0].enbName = device.bbu.eNBName;
            obj.report_info[0].enbID = device.bbu.eNBId;

            try {
                obj.report_info[0].resource_type = sub_resource[0].resource_type;
            } catch (e) {
                logger.info('new real slave resource_type default manual');
            }

            obj.report_info[0].Other = JSON.stringify({
                omc_status: device.bbu.omc_status
                , cell: device.bbu.cell
                , epcip2: device.bbu.au8DstIP2
                , epcip3: device.bbu.au8DstIP3
                , epcip4: device.bbu.au8DstIP4
            });

            device.rru.forEach(function (item, index) {
                obj.report_info[index + 1] = {minor_id: index + 2, name: 'rru'};

                try {
                    obj.report_info[index + 1].resource_type = sub_resource[0].resource_type;
                } catch (e) {
                    logger.info('new real slave resource_type default manual');
                }

                switch (item.u32Status) {
                    case '0':
                        obj.report_info[index + 1].status = RESOURCE_STATUS_IDLE;
                        break;
                    case '1':
                        obj.report_info[index + 1].status = STATUS_LOST;
                        break;
                    case '2':
                        obj.report_info[index + 1].status = RESOURCE_STATUS_BUSY;
                        break;
                    default:
                        logger.error('borad status is ' + item.u32Status + ' type = ' + typeof(item.u32Status));
                        break;
                }
                obj.report_info[index + 1].Other = JSON.stringify({
                    u8RackNo: item.u8RackNo
                    , u8ShelfNo: item.u8ShelfNo
                    , u8SlotNo: item.u8SlotNo
                });
            });
        }
        else {
            if (!obj.report_info || obj.report_info.length == 0) {
                obj.report_info = sub_resource;
            }

            if (obj.report_info) {
                obj.report_info.forEach(function (item) {
                    if (!item.status || item.status == STATUS_LOST)
                        item.status = RESOURCE_STATUS_IDLE;
                });
            }
        }

        return obj;
    }

    function saveSlaveToLocal(obj, port) {
        if (SlaveStore[obj.major_id])
            clearTimeout(SlaveStore[obj.major_id].timerObject);
        SlaveStore[obj.major_id] = clone(obj);

        SlaveStore[obj.major_id].timerObject = setTimeout(SlaveLostTimeout, config.master.slave_heartbeat_timeout * 1000, obj.major_id);

        delete obj._v;
        delete obj.cpu;
        delete obj.mem;
        delete obj.uptime;
        delete obj.hostname;
        delete obj.platfrom;
        delete obj.status;
        delete obj.register_date;
    }

    function renovateSlave(self, obj, slave, callback) {
        var oldStatus = obj.status;
        var sub_resource = obj.sub_resource;

        replaceSlaveInfo(obj, slave);

        logger.debug("renovateSlave", util.inspect(obj, {showHidden: true, depth: null}));

        database.Resource.update({major_id: obj.major_id}, {$set: obj}, {new: false, upsert: false})
            .exec(function (err) {

                saveSlaveToLocal(obj, slave.port);

                if (oldStatus == STATUS_LOST && slave.status != STATUS_LOST) {
                    self.emit("online", SlaveStore[obj.major_id]);
                }

                obj.sub_resource = sub_resource;

                callback(err, obj);
            });
    }

    function newSlave(self, slave, callback) {
        var resource = {};

        replaceSlaveInfo(resource, slave);
        var resource = clone(slave);

        resource.major_id = currentIndex++;
        resource.status = STATUS_NORMAL;
        resource.name = resource.ip;

        logger.debug("newSlave", util.inspect(resource, {showHidden: true, depth: null}));

        var newResource = new database.Resource(resource);

        newResource.save(function (err) {
            if (!err) {
                logger.info('new slave ', resource.ip);

                saveSlaveToLocal(resource, slave.port);

                self.emit("online", SlaveStore[obj.major_id]);
            }

            callback(err, resource);
        });
    }

    this.updateSlave = function (slave, callback) {
        mqUtil.sendRequestByRPC("beatheart slave", slave, config.gatewayAmqp.resourceQueue, callback);
    };

    this.getAllSlave = function () {
        return SlaveStore;
    };

    this.getSlaveByID = function (id, callback) {
        callback(null, SlaveStore[id]);
    };

    this.delSlave = function () {
    };

    database.Resource.update({}, {$set: {status: STATUS_LOST, report_info: []}}, {multi: true, upsert: false})
        .exec(function (err) {
        });
    SlaveModule.unique = this;
}

util.inherits(SlaveModule, EventEmitter);

module.exports = SlaveModule;