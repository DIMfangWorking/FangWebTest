var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function createResourceModel(initFlag)
{
    var ResourceSchema = new Schema({
        major_id    : { type : Number, index : true, unique: true, required : true }
      , type   : { type : String, enum : ['simulation', 'real'], required : true } 
      , name   : { type : String, index: true, unique: true, required: true }
      , ip     : { type : String, required : true }
      , port   : { type : String, default : 4000 }
      , desc   : { type : String, default : '' }
      , cpu    : { type : Number, default : 0 }
      , mem    : { type : Number, default : 0 }
      , uptime : { type : Number, default : 0 }
      , hostname : { type : String, default : '' }
      , platfrom : { type : String, default : '' }
      , register_date : { type : Date, default: Date.now}
      , status   : { type : String, enum : ['normal', 'lost'] }
      , sub_resource : [ {
            minor_id : { type : Number, required : true }
          , resource_type : { type : String, enum : ['auto', 'manual'], default : 'manual' }
          , name     : { type : String, required : true, trim: true }
          // , status   : { type : String, required : true, enum : ['idle', 'busy', 'lost'] }
          , ip       : { type : String }
          , epcip    : { type : String }
          , pdnip    : { type : String }
          , enbName  : { type : String }
          , enbID    : { type : Number }
          , Other    : { type : String, default : '' }
        } ]
      , report_info  : [ {
            minor_id : { type : Number, required : true }
          , resource_type : { type : String, enum : ['auto', 'manual'], default : 'manual' }
          , name     : { type : String, required : true, trim: true }
          , status   : { type : String, required : true, enum : ['idle', 'busy', 'lost'] }
          , ip       : { type : String }
          , epcip    : { type : String }
          , pdnip    : { type : String }
          , enbName  : { type : String }
          , enbID    : { type : Number }
          , Other    : { type : String, default : '' }
        } ]
    }, { autoIndex: false });

    ResourceSchema.index({major_id : 1});
    // ResourceSchema.index({name : 1});
    ResourceSchema.path('major_id').index({ unique: true, required : true });
    ResourceSchema.path('name').index({ unique: true, required : true, sparse : true });

    ResourceSchema.path('sub_resource').validate(function (sub_resource){
      var idList = {};
      var nameList = {};
      sub_resource = sub_resource.toObject();

      for(var minor_id in sub_resource)
      {
        if (idList[sub_resource[minor_id].minor_id] == true)
        {
          return false;
        }
        else 
        {
          idList[sub_resource[minor_id].minor_id] = true;
        }

        if (nameList[sub_resource[minor_id].name] == true)
        {
          return false;
        }
        else
        {
          nameList[sub_resource[minor_id].name] == true;
        }
      }

      return true;
    }, ' duplicate {PATH} key error index: minor_id or name');

    var ResourceModel = mongoose.model('Resource', ResourceSchema);

    ResourceModel.ensureIndexes(function (err){
      if (err)
      {
        logger.error("ResourceModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("ResourceModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
        var resource = new ResourceModel({  "major_id"    : 1
                                          , "type"   : "simulation"
                                          , "name"   : "sim_1"
                                          , "config" : ""
                                          , "ip"    : "172.31.3.52"
                                          , "desc"   : "Simulation docker"
                                          , "cpu"    : 50
                                          , "mem"    : 50
                                          , "uptime" : 111111111
                                          , "hostname" : "simulation"
                                          , "platfrom" : "Linux"
                                          , "register_date" : new Date()
                                          , "status"   : "normal"
                                          , "sub_resource" : [ {
                                                "minor_id" : 1
                                              , "name"     : "sim_1_1"
                                              , "status"   : "idle"
                                              , "ip"       : "172.31.3.1"
                                              , "epcip"    : "172.31.4.233"
                                              , "pdnip"    : "192.168.4.2"
                                              , "enbName"  : "CloudTest"
                                              , "enbID"    : 16
                                            }, {
                                                "minor_id" : 2
                                              , "name"     : "sim_1_2"
                                              , "status"   : "idle"
                                              , "ip"       : "172.31.3.2"
                                              , "epcip"    : "172.31.4.233"
                                              , "pdnip"    : "192.168.4.2"
                                              , "enbName"  : "CloudTest2"
                                              , "enbID"    : 19
                                           },{
                "minor_id" : 3
                , "name"     : "sim_1_3"
                , "status"   : "idle"
                , "ip"       : "172.31.3.3"
                , "epcip"    : "172.31.4.233"
                , "pdnip"    : "192.168.4.2"
                , "enbName"  : "CloudTest3"
                , "enbID"    : 22
            }, {
                "minor_id" : 4
                , "name"     : "sim_1_4"
                , "status"   : "idle"
                , "ip"       : "172.31.3.4"
                , "epcip"    : "172.31.4.233"
                , "pdnip"    : "192.168.4.2"
                , "enbName"  : "CloudTest4"
                , "enbID"    : 25
            }, {
                "minor_id" : 5
                , "name"     : "sim_1_5"
                , "status"   : "idle"
                , "ip"       : "172.31.3.5"
                , "epcip"    : "172.31.4.233"
                , "pdnip"    : "192.168.4.2"
                , "enbName"  : "CloudTest5"
                , "enbID"    : 28
            }]
                       });
        resource.save(function(err){if (err) logger.error("save resource error.", err);});
/*
        var resource2 = new ResourceModel({  "major_id"    : 2
                                          , "type"   : "real"
                                          , "name"   : "real_1"
                                          , "config" : ""
                                          , "ip"    : "172.31.5.163"
                                          , "desc"   : "Simulation docker"
                                          , "cpu"    : 50
                                          , "mem"    : 50
                                          , "uptime" : 111111111
                                          , "hostname" : "guow"
                                          , "platfrom" : "win32"
                                          , "register_date" : new Date()
                                          , "status"   : "normal"
                                          , "sub_resource" : [ {
                                                "minor_id" : 1
                                              , "name"     : "bbu"
                                              , "status"   : "idle"
                                              , "ip"       : "172.31.5.201"
                                              , "epcip"    : "172.31.5.179"
                                              , "pdnip"    : "10.10.10.10"
                                              , "enbName"  : "cloudtest1"
                                              , "enbID"    : 138
                                            },  {
                                                "minor_id" : 2
                                              , "name"     : "rru"
                                              , "status"   : "idle"
                                              , "ip"       : "172.31.5.201"
                                            }, {
                                                "minor_id" : 3
                                              , "name"     : "ue"
                                              , "status"   : "idle"
                                              , "ip"       : "172.31.5.201"
                                            },
                                          ]
                       });
        resource2.save(function(err){if (err) logger.error("save resource error.", err);});
*/
    }

    return ResourceModel;
}

function createTaskRecordModel(initFlag)
{
    var TaskRecordSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true }
      , rerun_id    : { type : Number, default : 0 }
      , type        : { type : String, required : true, enum : ['simulation', 'real']}
      , resource    : {
               major_id : { type : Number, required : true }
             , minor_id : { type : Number }
        }
      , resource_snapshot : { type : String }
      , task_type   : { type : String, enum : ['auto', 'manual'], default : 'manual'}
      , env_type    : { type : String }
      , user        : { type : String, required : true }
      , date        : { type : Date, default : Date.now }
      , status      : { type : String, required : true, enum : ['run', 'close'] }
      , step        : { type : String, default : '' }
      , run_time    : { type : Number, default : 0 }
      , revision    : String
      , code_path   : String
      , bin_file    : String
      , test_group  : { type : String, required : true }
      , taskgroup_snapshot : { type : String }
      , result      : { type : String, enum : [ 'success', 'fail'], default : 'fail' }
      , logs        : [ String ]
      , ei_basic    : [ { type : Schema.Types.Mixed } ]
      , ei_basic_image : [ { 
                name : { type : String, required : true, trim: true }
              , url  : { type : String, required : true, trim: true }
            }]
      , log_file    : { type : String, default : '' }
      , fail_message: { type : String, default : '' }
     });

    var TaskRecordModel = mongoose.model('TaskRecord', TaskRecordSchema);

    if (initFlag)
    {

    }

    return TaskRecordModel;
}

function createTestGroupModel(initFlag)
{
    var TestGroupSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true}
      , name        : { type : String, trim: true, index: true, unique: true }
      , type        : { type : String, required : true, enum : ['simulation', 'real', 'both']}
      , user        : { type : String, default : 'default' }
      , date        : { type : Date, default : Date.now }
      , update      : { type : Date, default : Date.now }
      , desc        : { type : String, default : '' }
      , testcase    : [{
               id   : { type : Number, required : true }
             , name : { type : String, required : true }
             , argv : [{ name : { type :String, required : true }, value : { type : String, required : true } }]
      }]
     }, { autoIndex: false });

    TestGroupSchema.index({name : 1});
    TestGroupSchema.index({id : 1});
    TestGroupSchema.path('id').index({ unique: true, required : true });
    TestGroupSchema.path('name').index({ unique: true, required : true });

    var TestGroupModel = mongoose.model('TestGroup', TestGroupSchema);
    TestGroupModel.ensureIndexes(function (err){
      if (err)
      {
        logger.error("TestGroupModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("TestGroupModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
        var TestGroup1 = new TestGroupModel({"id"       : 1
                                          , "name"     : 'TCG_Attach'
                                          , "type"     : 'both'
                                          , 'desc'     : 'ue online'
                                          , 'testcase' : [{'id' : 1, name : 'Attach'}]
                                          });
        TestGroup1.save(function(err){if (err) logger.error("save Test Group error.", err);});
    }

    return TestGroupModel;
}

function createTestCaseModel(initFlag)
{
    var TestCaseSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true}
      , name        : { type : String, trim: true, index: true, unique: true, required : true }
      , type        : { type : String, enum : ['simulation', 'real', 'both'], required : true}
      , user        : { type : String, default : 'default' }
      , version     : { type : String /*, required : true */}
      , date        : { type : Date, default : Date.now }
      , update      : { type : Date, default : Date.now }
      , desc        : { type : String, default : '' }
      , argv        : [{
             name   : { type : String, trim: true, index: false, unique: false, required : true }
           , type   : { type : String, enum : ['integer','string','ip'] }
           , value  : { type : String }     // 默认值
           , comment: { type : String, default : '' }
           }]
      , sequenceOfOpera    : [{
               id   : { type : Number, required : true }
             , name : { type : String, required : true }
             , type : { type : String, required : true, enum : ['keyword','component'], default : 'keyword' }
             , argv : [{ name : { type :String, required : true }, value : { type : String, required : true } }]
      }]
     }, { autoIndex: false });

    TestCaseSchema.index({id : 1});
    TestCaseSchema.index({name : 1});
    TestCaseSchema.path('id').index({ unique: true, required : true });
    TestCaseSchema.path('name').index({ unique: true, required : true, trim: true });

    var TestCaseModel = mongoose.model('TestCase', TestCaseSchema);
    TestCaseModel.ensureIndexes(function (err){
      if (err)
      {
        logger.error("TestCaseModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("TestCaseModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
        var TaskCase1 = new TestCaseModel({ "id"           : 1
                                       , "name"            : "Attach"
                                       , "type"            : "both"
                                       , "desc"            : "ue online"
                                       , "argv"            : []
                                       , "sequenceOfOpera" : [
                                                                  {  id     : 2
                                                                   , name   : 'CheckCellStatus'
                                                                   , argv   : [{name : 'Delay', value : '10'}
                                                                             , {name : 'EnbID', value : '134'}
                                                                             , {name : 'CellPCI', value : '10'}
                                                                             , {name : 'ExpectResult', value : '0'}
                                                                              ]
                                                                  }
                                                                , {  id     : 3
                                                                   , name   : 'AddUE'
                                                                   , argv   : [{name : 'Delay', value : '0'}
                                                                             , {name : 'UEGroupID', value : '1'}
                                                                             , {name : 'UENum', value : '1'}
                                                                              ]
                                                                  }
                                                                , {  id     : 5
                                                                   , name   : 'CheckUECnntState'
                                                                   , argv   : [{name : 'Delay', value : '0'}
                                                                             , {name : 'UEGroupID', value : '1'}
                                                                             , {name : 'ExpectResult', value : '0'}
                                                                              ]
                                                                  }
                                                                , {  id     : 7
                                                                   , name   : 'ULPing'
                                                                   , argv   : [{name : 'Delay', value : '0'}
                                                                             , {name : 'UEGroupID', value : '1'}
                                                                             , {name : 'PDNIP', value : '192.0.190.110'}
                                                                             , {name : 'PacketLen', value : '62'}
                                                                             , {name : 'Duration', value : '600'}
                                                                              ]
                                                                  }
                                                                , {  id     : 8
                                                                   , name   : 'CheckPingResult'
                                                                   , argv   : [{name : 'Delay', value : '0'}
                                                                             , {name : 'UEGroupID', value : '1'}
                                                                             , {name : 'ExpectResult', value : '0'}
                                                                              ]
                                                                  }
                                                                , {  id     : 4
                                                                   , name   : 'DelUEGroup'
                                                                   , argv   : [{name : 'Delay', value : '0'}
                                                                             , {name : 'UEGroupID', value : '1'}
                                                                             , {name : 'UENum', value : '1'}
                                                                              ]
                                                                  }
                                                            ]
                                    });

        TaskCase1.save(function(err){if (err) logger.error("save TaskCase error.", err);});
    }

    return TestCaseModel;
}

function createComponentModel(initFlag)
{
    var ComponentSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true }
      , name        : { type : String, trim: true, index: true, unique: true, required : true }
      , type        : { type : String, required : true, enum : ['simulation', 'real', 'both']}
      , user        : { type : String, default : 'default' }
      , date        : { type : Date, default : Date.now }
      , update      : { type : Date, default : Date.now }
      , desc        : { type : String, default : '' }
      , argv        : [{
             name   : { type : String, trim: true, index: false, unique: false, required : true }
           , type   : { type : String, required : true, enum : ['integer','string','ip'] }
           , value  : { type : String }
           , comment: { type : String, default : '' }
           }]
      , sequenceOfOpera    : [{
               id   : { type : Number, required : true }
             , name : { type : String, required : true }
             , type : { type : String, enum : ['keyword','component'], default : 'keyword'}
             , argv : [{ name : { type :String, required : true }, value : { type : String, required : true } }]
      }]
     }, { autoIndex: false });

    ComponentSchema.index({id : 1});
    ComponentSchema.index({name : 1});
    ComponentSchema.path('id').index({ unique: true, required : true });
    ComponentSchema.path('name').index({ unique: true, required : true, trim: true });

    var ComponentModel = mongoose.model('Component', ComponentSchema);
    ComponentModel.ensureIndexes(function (err){ 
      if (err)
      {
        logger.error("ComponentModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("ComponentModel.ensureIndexes success.");
      }
    });

    return ComponentModel;
}

function createKeyWordModel(initFlag)
{
    var KeyWordSchema = new Schema({
        id          : { type : Number, index : true, unique: true, required : true }
      , name        : { type : String, trim: true, index: true, unique: true, required : true }
      , env         : { type : String, required : true, enum : ['simulation', 'real', 'both']}
      , type        : { type : String, required : true, enum : ['delay', 'chkpoint', 'action', 'info']}
      , user        : { type : String, default : 'default' }
      , date        : { type : Date, default : Date.now }
      , update      : { type : Date, default : Date.now }
      , desc        : String
      , code        : { type : String, trim: true, default : 'default'}
      , argv        : [{
             name   : { type : String, trim: true, index: false, unique: false, required : true }
           , type   : { type : String, enum : ['integer', 'string', 'ip'], default : 'integer' }
           , value  : { type : String, default : null }    //默认值
           , comment: { type : String, default : '' }
           }]
     }, { autoIndex: false });

    KeyWordSchema.index({id : 1});
    KeyWordSchema.index({name : 1});
    KeyWordSchema.path('id').index({ unique: true, required : true });
    KeyWordSchema.path('name').index({ unique: true, required : true, trim: true });

    var KeyWordModel = mongoose.model('KeyWord', KeyWordSchema);
    KeyWordModel.ensureIndexes(function (err){ 
      if (err)
      {
        logger.error("KeyWordModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("KeyWordModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
        var keyword_array = [];
        var keyword = new KeyWordModel({  "id"    : 1
                                       , "name"   : "SetDataBase"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "run sql"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'EnbID', type : 'integer', comment : 'use by simulation'}
                                                   , {name : 'Option', type : 'string', value : 't_ipv4.find()', comment : 'tablename.option(args) option enum [save,insert,delete,remove,update,overwrite,find,select]'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 2
                                       , "name"   : "CheckCellStatus"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check cell status"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'EnbID', type : 'integer', comment : 'use by simulation'}
                                                   , {name : 'CellID', type : 'integer', comment : 'use by real, 255 means any cell'}
                                                   , {name : 'ExpectResult', type : 'integer', comment : 'cell status'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 3
                                       , "name"   : "AddUE"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer', comment : 'use by simulation'}
                                                   , {name : 'CellID', type : 'integer', value : '255', comment : 'use by real, 255 means any cell'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'use by simulation. enum 0 : src_enb, 1 : tgt_enb. default 0'}
                                                   , {name : 'UENum', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 4
                                       , "name"   : "DelUEGroup"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "del ue group"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer', comment : 'use by simulation'}
                                                   , {name : 'UENum', type : 'integer', comment : 'use by simulation'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 5
                                       , "name"   : "CheckUECnntState"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check cell status"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 6
                                       , "name"   : "CheckUserInactive"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check cell status"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'enum 0 : src_enb, 1 : tgt_enb. default 0'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 7
                                       , "name"   : "LoadedVersion"
                                       , "env"    : 'real'
                                       , "type"   : "action"
                                       , "desc"   : "Loaded Version"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'VersionName', type : 'string', value : '' }]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 8
                                       , "name"   : "CheckVersion"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "Check Version"
                                       , "argv"   : [{name : 'Delay', type : 'integer' }
                                                   , {name : 'VersionName', type : 'string' }
                                                   , {name : 'ExpectResult', type : 'integer', value : 0 }]
                                    });

        keyword_array.push(keyword);
        keyword = new KeyWordModel({  "id"    : 9
                                       , "name"   : "HandOver"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "hand over"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'DstEnbName', type : 'integer'}
                                                   , {name : 'MeasId', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 10
                                       , "name"   : "CheckHandOver"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check hand over"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);


        keyword = new KeyWordModel({  "id"    : 11
                                       , "name"   : "BearSetup"
                                       , "env"    : 'both'
                                       , "type"   : "info"
                                       , "desc"   : "CQI"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'Qci', type : 'integer'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'enum 0 : src_enb, 1 : tgt_enb. default 0'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 12
                                       , "name"   : "CheckBearSetup"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "CQI"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'enum 0 : src_enb, 1 : tgt_enb. default 0'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 13
                                       , "name"   : "Reestablishment"
                                       , "env"    : 'both'
                                       , "type"   : "info"
                                       , "desc"   : "CQI"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'enum 0 : src_enb, 1 : tgt_enb. default 0'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 14
                                       , "name"   : "CheckReestablishment"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "CQI"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'EnbType', type : 'integer', value : '0', comment : 'enum 0 : src_enb, 1 : tgt_enb. default 0'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 15
                                       , "name"   : "ReConfigEnb"
                                       , "env"    : 'both'
                                       , "type"   : "info"
                                       , "desc"   : "query and config enb"
                                       , "argv"   : [{name : 'Delay', type : 'integer' }]
                                                   // , {name : 'Option', type : 'string', value : 't_ipv4.find()', comment : 'tablename.option(args) option enum [save,insert,delete,remove,update,overwrite,find,select]' }]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 16
                                       , "name"   : "ULPing"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PDNIP', type : 'ip'}
                                                   , {name : 'PacketLen', type : 'integer'}
                                                   , {name : 'Duration', type : 'integer', comment : 'real : unit for seconds, sim : unit for times'}
                                                   , {name : 'LchNum', type : 'integer', value : '3', comment : 'use by sim, default 3'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 17
                                       , "name"   : "CheckPingResult"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check cell status"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'ExpectResult', type : 'integer'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 18
                                       , "name"   : "ULTCP"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PDNIP', type : 'ip', default : '10.10.10.10'}
                                                   , {name : 'PacketLen', type : 'integer'}
                                                   , {name : 'Duration', type : 'integer', comment : 'real : unit for seconds, sim : unit for times'}
                                                   , {name : 'LchNum', type : 'integer', value : '3', comment : 'use by sim, default 3'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 19
                                       , "name"   : "DLTCP"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PDNIP', type : 'ip', default : '10.10.10.10'}
                                                   , {name : 'PacketLen', type : 'integer'}
                                                   , {name : 'Duration', type : 'integer', comment : 'real : unit for seconds, sim : unit for times'}
                                                   , {name : 'LchNum', type : 'integer', value : '3', comment : 'use by sim, default 3'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 20
                                       , "name"   : "ULUDP"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PDNIP', type : 'ip', default : '10.10.10.10'}
                                                   , {name : 'PacketLen', type : 'integer'}
                                                   , {name : 'BandWitdth', type : 'integer', comment : 'real : unit for MB'}
                                                   , {name : 'Duration', type : 'integer', comment : 'real : unit for seconds, sim : unit for times'}
                                                   , {name : 'LchNum', type : 'integer', value : '3', comment : 'use by sim, default 3'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 21
                                       , "name"   : "DLUDP"
                                       , "env"    : 'both'
                                       , "type"   : "action"
                                       , "desc"   : "add ue"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PDNIP', type : 'ip', default : '10.10.10.10'}
                                                   , {name : 'PacketLen', type : 'integer'}
                                                   , {name : 'BandWitdth', type : 'integer', comment : 'real : unit for MB'}
                                                   , {name : 'Duration', type : 'integer', comment : 'real : unit for seconds, sim : unit for times'}
                                                   , {name : 'LchNum', type : 'integer', value : '3', comment : 'use by sim, default 3'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 30
                                       , "name"   : "CheckFlowResult"
                                       , "env"    : 'both'
                                       , "type"   : "chkpoint"
                                       , "desc"   : "check flow test result"
                                       , "argv"   : [{name : 'Delay', type : 'integer'}
                                                   , {name : 'UEGroupID', type : 'integer'}
                                                   , {name : 'PSRP', type : 'integer', default : 0, comment : 'no use'}
                                                   , {name : 'ULThrput', type : 'integer', default : 0, comment : 'real : unit for MB'}
                                                   , {name : 'DLThrput', type : 'integer', default : 0, comment : 'real : unit for MB'}]
                                    });

        keyword_array.push(keyword);

        keyword = new KeyWordModel({  "id"    : 31
                                       , "name"   : "EIDetail"
                                       , "env"    : 'both'
                                       , "type"   : "info"
                                       , "desc"   : "get all ei detail"
                                       , "argv"   : [ ]
                                    });

        keyword_array.push(keyword);

        KeyWordModel.count(function (err, count){
            if (count == keyword_array.length)
            {
                return;
            }

            for (var index in keyword_array)
            {
                keyword_array[index].save(function(err){if (err) logger.error("save keyword error.", err);});
            }
        });
    }

    return KeyWordModel;
}

function createEIDetailedModel(initFlag)
{
    var EIDetailedSchema = new Schema({
        MsgId       : { type : Number, index : true, unique: true, required : true }
      , name        : { type : String, index : true, unique: true, required : true }
      , DspId       : { type : Number, required : true }
      , CoreId      : { type : Number, required : true }
      , Tlv         : { type : Object, required : true }
      , Struct      : { type : Object, required : true }
     }, { autoIndex: false });

    EIDetailedSchema.index({MsgId : 1});
    EIDetailedSchema.index({name : 1});
    EIDetailedSchema.path('MsgId').index({ unique: true, required : true });
    EIDetailedSchema.path('name').index({ unique: true, required : true, trim: true });

    var EIDetailedModel = mongoose.model('EIDetailed', EIDetailedSchema);

    EIDetailedModel.ensureIndexes(function (err){ 
      if (err)
      {
        logger.error("EIDetailedModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("EIDetailedModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {

    }

    return EIDetailedModel;
}

function createCIConfigModel(initFlag)
{
    var CIConfigSchema = new Schema({
         Id           : { type : Number, index : true, unique: true, required : true }
        , type        : { type : String, enum : ['simulation', 'real'], required : true, trim: true }
        , env_type    : { type : String, required : true, trim: true }
        , Another_Name: { type : String }
        , svn_user    : { type : String, required : true }
        , svn_password: { type : String, required : true }
        , email_notify: [ String ]
        , test_group  : { type : String, required : true }
      } , { autoIndex: false });

    CIConfigSchema.index({Id : 1});
    CIConfigSchema.index({type : 1, env_type : 1}, {unique : true, required : true, trim: true});
    CIConfigSchema.path('Id').index({ unique: true, required : true });

    var CIConfigModel = mongoose.model('CIConfig', CIConfigSchema);

    CIConfigModel.ensureIndexes(function (err){ 
      if (err)
      {
        logger.error("CIConfigModel.ensureIndexes error ", err);
      }
      else
      {
        logger.info("CIConfigModel.ensureIndexes success.");
      }
    });

    if (initFlag)
    {
        var ciConfig = new CIConfigModel({  "Id"    : 1
                                       , "type"   : "simulation"
                                       , "env_type"    : 'LTE'
                                       , "Another_Name" : 'Linux_CI'
                                       , "svn_user" : "guowei"
                                       , "svn_password" : "123456"
                                       , "test_group" : "CI"
                                    });

        ciConfig.save(function(err){if (err) logger.error("save CI Config error.", err);});

        ciConfig = new CIConfigModel({  "Id"    : 2
                                       , "type"   : "real"
                                       , "env_type"    : 'LTE'
                                       , "Another_Name" : 'xa'
                                       , "svn_user" : "guowei"
                                       , "svn_password" : "123456"
                                       , "test_group" : "CI"
                                    });

        ciConfig.save(function(err){if (err) logger.error("save CI Config error.", err);});
    }

    return CIConfigModel;
}

function createEmailSeverConfigModel(initFlag)
{
    var EmailSeverConfigSchema = new Schema({
          Ip       : { type : String, required : true }
        , Port     : { type : Number, default: 465 }
        , Security : { type : Boolean, required : true}
        , User     : { type : String, default: 'liujinxing' }
        , Password : { type : String, default: 'liujinxing' }
        , Suffix   : { type : String, default: '@bj.xinwei.com.cn'}
    }, { autoIndex: false });

    EmailSeverConfigSchema.index({Ip : 1});
    EmailSeverConfigSchema.path('Ip').index({ unique: true, required : true, trim: true });

    var EmailSeverConfigModel = mongoose.model('EmailSeverConfig', EmailSeverConfigSchema);

    EmailSeverConfigModel.ensureIndexes(function (err){
        if (err)
        {
            logger.error("EmailSeverConfigModel.ensureIndexes error ", err);
        }
        else
        {
            logger.info("EmailSeverConfigModel.ensureIndexes success.");
        }
    });

    if (initFlag)
    {
        emailSeverConfig = new EmailSeverConfigModel({"Ip"   : "172.16.2.3"
            , "Security" : 'false'
        });

        emailSeverConfig.save(function(err){if (err) logger.error("save EmailSever Config error.", err);});
    }

    return EmailSeverConfigModel;
}

function createUserManagerConfigModel(initFlag)
{
    //logger.info("createUserManagerConfigModel strat !");
    var UserManagerConfigSchema = new Schema({
          Type       : { type : String, required : true }
        , user_config    : { type : Schema.Types.Mixed }
    }, { autoIndex: false });

    UserManagerConfigSchema.index({Type : 1});
    UserManagerConfigSchema.path('Type').index({ unique: true, required : true, trim: true });

    var UserManagerConfigModel = mongoose.model('UserManagerConfig', UserManagerConfigSchema);

    UserManagerConfigModel.ensureIndexes(function (err){
        if (err)
        {
            logger.error("UserManagerConfigModel.ensureIndexes error ", err);
        }
        else
        {
            logger.info("UserManagerConfigModel.ensureIndexes success.");
        }
    });

    if (initFlag)
    {
        userManagerConfig = new UserManagerConfigModel({"Type"   : "LDAP"
            , "user_config" : {
                  "url" : "ldap://172.31.2.1:389"
                , "bind_dn" : "CN=Administrator,CN=Users,DC=xa,DC=xinwei,DC=com"
                , "password" : "XWadmin89522929"
                , "search_base" : "OU=xateam,DC=xa,DC=xinwei,DC=com"
                , "connect_timeout" : 10
                , "idle_timeout" : 3
                , "search_timeout" : 60
                , "update_time" : '2015-10-27T08:23:25.933Z'
                , "last_updatetime" : '2015-11-30T08:23:25.933Z'
            }
        });

        userManagerConfig.save(function(err){if (err) logger.error("save User Manger Config error.", err);});
    }

    return UserManagerConfigModel;
}


module.exports = {createResourceModel : createResourceModel
    , createComponentModel : createComponentModel
    , createTaskRecordModel : createTaskRecordModel
    , createTestGroupModel : createTestGroupModel
    , createTestCaseModel : createTestCaseModel
    , createKeyWordModel : createKeyWordModel
    , createEIDetailedModel : createEIDetailedModel
    , createCIConfigModel : createCIConfigModel
    , createEmailSeverConfigModel : createEmailSeverConfigModel
    , createUserManagerConfigModel : createUserManagerConfigModel
};