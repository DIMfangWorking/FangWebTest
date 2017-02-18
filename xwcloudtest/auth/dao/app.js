var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var util = require('util');
module.exports = function () {
    var dbConfig = config.database;
    var dbsUri = "";
    logger.debug("init auth dao");

    if (!dbConfig.port)
    {
        dbsUri = dbConfig.protocol + '://' + dbConfig.ip + '/' + dbConfig.db_name;
    }
    else
    {
        dbsUri = dbConfig.protocol + '://' + dbConfig.ip + ':' + dbConfig.port + '/' + dbConfig.db_name;
    }

    var db = mongoose.connect(dbsUri);

    db.connection.on('open', function () {logger.info("mongoose connect");}); 
    db.connection.on('connected', function () {logger.info("mongoose connected");}); 
    db.connection.on('disconnected', function () {logger.info("mongoose disconnected");});
    logger.info('first!');
    var UserManagerConfig = model.createUserManagerConfigModel(0);
    var database = { 
              UserManagerConfig : UserManagerConfig
    };
    if (util.isFunction(getAuthDaoInit())) {
        logger.info('second!');
        var getAuthApp = getAuthDaoInit();
        getAuthApp(database);
    }

    return database;
};
