/**
 * Created by Administrator on 2015/9/15.
 */

define(function(require){
  var CommonUI = require("ui/Common"),
      common = require('common/common');

  var RealResourceObj = function(ParaList){
    this.ID = ParaList.ID;
    this.Majorid = ParaList.major_id;
    this.MinorResList = [];
    this.Status = ParaList.status;
    this.Name = ParaList.name;
    this.IP = ParaList.ip;
    this.Config = ParaList.config;
  };

  RealResourceObj.prototype = {
    GetResId:function () {
      if(this.ID == null){
        console.log("No ResID");
        return;
      }
      return this.ID;
    },

    GetMajorId:function () {
      if(this.Majorid == null){
        console.log("No MajorId");
        return;
      }

      return this.Majorid;
    },

    GetMinorResList:function () {
      if(this.MinorResList.length == 0){
        console.log("MinorResList empty");
        return;
      }

      return this.MinorResList;
    },

    GetResIndx:function () {
      if(this.ID == null){
        console.log("No Resource ID");
        return;
      }

      return this.ID;
    },

    AddMinorRes:function(Res){
      this.MinorResList.push(Res);
    },

    AddMinorResList:function(ResList){
      var ResItem = null,
          ResInst = null;
      for(ResItem in ResList){
        if(ResList.hasOwnProperty(ResItem)){
          ResInst = new SubResourceObj(ResList[ResItem]);
          this.AddMinorRes(ResInst);
        }
      }

    },

    CreateTask: function (Para,callback) {

      if (this.Majorid == null ) {
        return;
      }

      var ReqContent = {
        user: $.cookie('username'),
        type:"real",
        reversion:"",
        code_path:"",
        test_group:Para.TestGrpName,
        resource:{"major_id":this.GetMajorId().toString()},
        measured_object:Para.VerSubmitObj

      };

      $('#Log_TaskStatusContent').text("");
      $("#Log_TaskStatus").data("plugin_tinyscrollbar").update();

      $.ajax({
        type:"POST",
        url:"/front/task",
        cache:false,
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        context: this,
        data:JSON.stringify(ReqContent),
        success:function (TaskInfo) {
          var LogHandler = null;
          if(TaskInfo.result === 0 && TaskInfo.message === 'success'){
            this.CurTaskId = TaskInfo.task_id;
            LogHandler = callback(TaskInfo);
            this.QueryRunningLog(LogHandler,this.CurTaskId,0);
          }
          else{
            alert('Create Task Failed Info: \nresult = '+ TaskInfo.result + '\nMessage = '+TaskInfo.message);
            callback(TaskInfo);
          }
        },

        error: function() {
          callback(null);
          console.log('Create Task Failed, Resource MajorId:'+this.GetMajorId()+' MinorId:'+this.GetMinorId());
        }
      });
    },

    QueryRunningLog: function(callback,task_id,log_id){
      var contentTypeStr = 'application/json;charset=UTF-8',
        urlpara = '/front/task/log/'+ task_id +"/"+log_id;

      $.ajax({
        type:"GET",
        url:urlpara,
        cache:false,
        dataType:'json',
        contentType:contentTypeStr,
        context:this,
        success:function (TaskLog){

          if(TaskLog.result !== 0 && TaskLog.message !== 'success'){
            return;
          }

          callback(TaskLog,this);

        },
        error: function() {
          console.log("Get TaskId:"+task_id+" LogQuery Error!");
        }
      });
    },

    TaskStatusQuery: function(task_id,callback){
      var contentTypeStr = 'application/json;charset=UTF-8',
        urlpara = '/front/task/info/'+ task_id;

      $.ajax({
        type:"GET",
        url:urlpara,
        cache:false,
        dataType:'json',
        contentType:contentTypeStr,
        context:this,
        success:function (TaskStatus){
          callback(TaskStatus);
        },
        error: function() {
          console.log("Get TaskId:"+task_id+" LogQuery Error!");
        }
      });
    },

    QueryResHistory:function(callback){
      //请求历史操作Log

      var contentTypeStr = 'application/json;charset=UTF-8';
      var urlpara = '/front/task/list?major_id='+ this.GetMajorId();

      $.ajax({
        type:"GET",
        url:urlpara,
        cache:false,
        dataType:'json',
        contentType:contentTypeStr,
        context:this,
        success:function(ResHandleHistory){

          if(callback !=null){
            callback(ResHandleHistory,this);
          }

        },
        error: function() {
          console.log("QueryResHandleHistory Error! ResId = " + this.GetResIndx());
          callback(null,this);
        }
      });

    }

  };

  var SubResourceObj = function(ParaList){
    var context = this;
    this.commonPara = {};
    this.specificPara = {};
    delete ParaList._id;

    //读入通用参数commonPara和与资源相关的特定参数SpecificProperty
    $.each(ParaList,function(key,value){
      switch (key){
        case "ID":
          context.commonPara.ID = value;
          break;
        case "minor_id":
          context.commonPara.Minorid = value;
          break;
        case "status":
          context.commonPara.Status = value;
          break;
        case "name":
          context.commonPara.Name = value;
          break;
        case "Other":
          if(value.length !==0){
            $.extend(true,context.specificPara,JSON.parse(value));
          }

          break;
        default :
          context.specificPara[key] = value;
          break;
      }
    });
  };
  SubResourceObj.prototype = {
    GetMajorId:function () {
      if(this.Majorid == null){
        console.log("No MajorId");
        return;
      }

      return this.Majorid;
    },

    GetMinorId:function () {
      if(this.Minorid == null){
        console.log("No MinorId");
        return;
      }

      return this.Minorid;
    },

    GetResIndx:function () {
      if(this.ID == null){
        console.log("No Resource ID");
        return;
      }

      return this.ID;
    },




  };

  return RealResourceObj;
});





