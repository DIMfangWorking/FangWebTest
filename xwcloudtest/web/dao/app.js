var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function createUserModel(initFlag)
{
    var UserSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true }
      , name        : { type : String, trim: true, index: true, unique: true, required : true }
      , password    : { type : String, required : true }
      , date        : { type : Date, default : Date.now }
      , update      : { type : Date, default : Date.now }
      , email        : { type : String, required : true }
      , desc        : { type : String, default : '' }
     }, { autoIndex: false });

    UserSchema.index({id : 1, name : 1});
    UserSchema.path('id').index({ unique: true, required : true });
    UserSchema.path('name').index({ unique: true, required : true, trim: true });

    var UserModel = mongoose.model('User', UserSchema);
    UserModel.ensureIndexes(function (err){ 
      if (err)
      {
        logger.error("UserModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("UserModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
      var UserList = [{'name' : 'quleixing', 'password' : '123456'},
              {'name' : 'xujianhua', 'password' : '123456'},
              {'name' : 'xiaoxu', 'password' : '123456'},
              {'name' : 'guow', 'password' : '123456'},
              {'name' : 'test', 'password' : '123456'}];

      UserList.forEach(function (item, index){
        new UserModel({id : index + 1
                     , name : item.name
                     , password : item.password
                     , email:item.name+'@bj.xinwei.com.cn'}).save(function(err){if (err) logger.info("user create :" , err);});
      });
    }

    return UserModel;
}

module.exports = function () {
    var dbConfig = config.database;
    var dbsUri = "";

    logger.debug("init web dao");

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

    return { //User : createUserModel(1) ,
             CIConfig : model.createCIConfigModel(1)
           , EmailSeverConfig : model.createEmailSeverConfigModel(1)
           , UserManagerConfig : model.createUserManagerConfigModel(1)
           , Resource : model.createResourceModel(0)
           , TaskRecord : model.createTaskRecordModel(0)
           , Component : model.createComponentModel(0)
           , KeyWord : model.createKeyWordModel(0)
           , TestCase : model.createTestCaseModel(0)
           , TestGroup : model.createTestGroupModel(0)
           , EIDetailed : model.createEIDetailedModel(0)
         };
};
