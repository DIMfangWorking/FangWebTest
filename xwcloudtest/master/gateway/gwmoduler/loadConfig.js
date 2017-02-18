var SlaveModel = require('./slave');

function EIConfigModel(db, mqUtil)
{
    //logger.info("EIConfigModel" + mqUtil);
    //throw new Error("EIConfigModel错误");
    var database = db;
    var eIDetailedMap = { };
    var slaveManger = new SlaveModel(db, mqUtil);

    slaveManger.addListener('online', function (obj) {
        var postData = eIDetailedMap;

        var options = {
            port: obj.port,
            hostname: obj.ip,
            method: 'POST',
            path: '/slave/ei/config/',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        };

        sendHttpRequest(options, JSON.stringify(postData), function (err, res, chunk) {
            if (err) logger.error(err);
        });
    });

    this.loadEIDetailed = function (file, callback) {
        database.EIDetailed.find().exec(function(err, result){
            if (err)
            {
                logger.info('load ei basic error. ', err);
                callback(err, result);
                return ;
            }

            result.forEach(function(item){
                eIDetailedMap[item.MsgId] = item;
            });

            callback(err, result);

            slaveList = slaveManger.getAllSlave();
            for (var key in slaveList)
            {
                var options = {
                    port: slaveList[key].port,
                    hostname: slaveList[key].ip,
                    method: 'POST',
                    path: '/slave/ei/config/',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    }
                };

                sendHttpRequest(options, JSON.stringify(eIDetailedMap), function (err, res, chunk) {
                    if (err) logger.error(err);
                });
            }
        });
    };

    this.getEIDetailed = function () {
        return eIDetailedMap;
    };

    this.loadEIDetailed(null, function(err, result){ });
}

module.exports = EIConfigModel;