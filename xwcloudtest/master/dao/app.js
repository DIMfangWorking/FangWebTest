var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

module.exports = function () {
    var dbConfig = config.database;
    var dbsUri = "";
    var options = {  
              server: {
                  auto_reconnect: true,
                  poolSize: 5
               }
             };

    logger.debug("init master dao");

    if (!dbConfig.port)
    {
        dbsUri = dbConfig.protocol + '://' + dbConfig.ip + '/' + dbConfig.db_name;
    }
    else
    {
        dbsUri = dbConfig.protocol + '://' + dbConfig.ip + ':' + dbConfig.port + '/' + dbConfig.db_name;
    }

    logger.info("dbsUri : ", dbsUri);

    var db = mongoose.connect(dbsUri, options);

    db.connection.on('open', function () {logger.info("mongoose connect");}); 
    db.connection.on('connected', function () {logger.info("mongoose connected");}); 
    db.connection.on('disconnected', function () {logger.info("mongoose disconnected");});

    return { Resource : model.createResourceModel(1)
           , UserManagerConfig : model.createUserManagerConfigModel(1)
           , TaskRecord : model.createTaskRecordModel(0)
           , Component : model.createComponentModel(0)
           , KeyWord : model.createKeyWordModel(1)
           , TestCase : model.createTestCaseModel(1)
           , TestGroup : model.createTestGroupModel(1)
           , EIDetailed : model.createEIDetailedModel(0)
           , CIConfig : model.createCIConfigModel(1)
         };
};