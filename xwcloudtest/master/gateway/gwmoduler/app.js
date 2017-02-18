var util = require('util');

module.exports = function (db) {
    var moduleObject = {};

    var moduleArray = autoLoadModule(pwd + "/master/gateway/gwmoduler");
    logger.info("Gateway is Awaiting RPC requests");
    var messageQ = new MsgQueue({url:config.gatewayAmqp.url});
    var mqUtil = new MQUtil(messageQ);
    mqUtil.msgQServer('gateway');
    logger.info(mqUtil);
    moduleArray.forEach(function(item) {
        logger.info("item : " + item);
        //throw new Error("item");
        var loadObj = item(db, mqUtil);
        if (util.isNullOrUndefined(loadObj))
        {
            loadObj = new item(db, mqUtil);
        }

        for (var key in loadObj)
        {
            // if(loadObj.hasOwnProperty(key))
            moduleObject[key] = loadObj[key];
        }
    });

    return moduleObject;
};