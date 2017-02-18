/**
 * Created by Administrator on 2015/10/22.
 */



define(function(require){
  var SimRes = require("obj/SimResourceObj"),
      $ = require('jquery');
  require("jquery_getParams");
  require("bootstrap");
  require("jquery_tinyscrollbar");
  require("jquery_mousewheel");
  require("jquery_kinetic");
  require("imagepanner");
  require("bootstrap_notify");

  var TaskId = $.getURLParam('TaskId'),
      ResType = $.getURLParam('ResType'),
      SubType = $.getURLParam('SubType');

  if(TaskId === null || ResType==null){
    alert('请选择任务');
    window.open("homepage.html","_self");
  }
  $(function () {

    //TODO:查询设备状态和最近历史操作
    $("#MajorId").parent().popover({
      'trigger':'click hover'
    });
    $("#Log_TaskStatus").tinyscrollbar();
    var panimage1 = new imagepanner({
      wrapper: $('#pcontainer1'), // jQuery selector to image container
      maxlevel: 4 // maximum zoom level
    });
    SimRes.prototype.TaskStatusQuery(TaskId,TaskStatusHandle);

  });

  function TaskStatusHandle(TaskStatus){

    var TaskItem = null,
        ResItem = null,
        MajorId = null,
        MinorId = null,
        DevInfo = null,
        MinorRes = null,
        InfoHandler = {
      TaskInfoHandler:{
        id:function(text){
          $("#TaskId > span.badge").text(text);} ,
        status:function(text){
          if(text === "run"){
            $("#TaskStatus > span.badge").text("运行中").attr("class","badge badge-info");
            //TODO:实时展示运行步骤
          }
          else if(text === "close"){
            $("#TaskStatus > span.badge").text("完成").attr("class","badge badge-success");
          }
          else{
            $("#TaskStatus > span.badge").text("未知").attr("class","badge badge-warning");
          }
        } ,
        date:function(text){
          $("#CreateTime > span.badge").text((new Date(text)).toLocaleString());},
        user:function(text){
          $("#CreateUsr > span.badge").text(text);
        } ,
        test_group: function(text){
          $("#ExecTestGrp > span.badge").text(text);
        },
        result:function(text){
          if(text === "fail"){
            $("#ExecResult > span.badge").text("失败").attr("class","badge badge-important");
          }
          else if(text === "success"){
            $("#ExecResult > span.badge").text("成功").attr("class","badge badge-success");
          }
          else{
            $("#ExecResult > span.badge").text("未知").attr("class","badge badge-warning");
          }
        } ,
        log_file:function(LogFileHref){
          if(LogFileHref==null || LogFileHref.length===0){
            $("#LogDownload").removeClass("badge-info").addClass("badge-important");
            return;
          }
          $("#LogDownload").attr("href",LogFileHref);
        },
        run_time:function(time){
          $("#RunTime > span.badge").text(time/1000+"s");
        },
        logs:function(Log){
          if(Log.length ===0){
            return;
          }
          for(var LogItem in Log){
            if(Log.hasOwnProperty(LogItem)){
              $('#Log_TaskStatusContent').append($("<p/>").html(Log[LogItem]));
            }
          }
          $("#Log_TaskStatus").data("plugin_tinyscrollbar").update("bottom");

        },
        ei_basic_image:function(ImageInfo){
          var EiImageSection = $("#EiInfo"),
              ImageIndex = 0,
              ImageName = "",
              ImageURL = "",
              ImageDom = $('<div />');

          if(ImageInfo ==null || ImageInfo.length ===0){
            console.log("No EIImage");
            return;
          }
          for(ImageIndex=0;ImageIndex < ImageInfo.length;++ImageIndex){
            ImageName = ImageInfo[ImageIndex].name;
            ImageURL = ImageInfo[ImageIndex].url;
            $('<div class="col-md-4" />').append($("<p/>").text(ImageName))
                                         .append($("<img/>")
                                          .attr({ src:ImageURL,
                                                  width:400,
                                                  height:300}))
                                         .appendTo(ImageDom);
          }
          $("a[href=#EiInfo]").on('show.bs.tab', function (e) {
            if($.trim($("#EiInfo").text()) === ""){
              ImageDom.appendTo(EiImageSection);
            }
          });
        }
        //step:null,
        //task_fail_message:null
      },
      DevInfoHandler:{
        Major:{
          major_id:function(text){
            $("#MajorId > span.badge").text(text);},
          type:function(text){
            $("#Env > span.badge").text(text);},
          name:function(text){
            $("#MajorName > span.badge").text(text);},
          ip:function(text){
            $("#IPAddr > span.badge").text(text);},
          desc:function(text){
            $("#Desc > span.badge").text(text);},
          cpu:function(text){
            $("#CPUCost > span.badge").text(text+"%");
            if(parseInt(text) > 60){
              $("#CPUCost > span.badge").attr("class","badge badge-warning")
            }
          },
          mem:function(text){
            $("#MemCost > span.badge").text(text+"%");
            if(parseInt(text) > 60){
              $("#MemCost > span.badge").attr("class","badge badge-warning")
            }
          },
          uptime:function(text){
            $("#PowerOnTime > span.badge").text(text+"s");
          },
          hostname:function(text){
            $("#HostName > span.badge").text(text);
          },
          platfrom:function(text){
            $("#OpeType > span.badge").text(text);
          },
          register_date:function(text){
            $("#RegisterTime > span.badge").text((new Date(text)).toLocaleString());
          },
          status:function(text){
            if(text === "lost"){
              $("#MajorStatus > span.badge").text("失联").attr("class","badge badge-important");
            }
            else if(text === "normal"){
              $("#MajorStatus > span.badge").text("正常").attr("class","badge badge-success");
            }

          }
        },
        Minor:{
          enbID:function(text){
            $("#EnbID > span.badge").text(text);
          },
          enbName:function(text){
            $("#EnbName > span.badge").text(text);
          },
          epcip:function(text){
            $("#EpcIp > span.badge").text(text);
          },
          ip:function(text){
            $("#LocalIp > span.badge").text(text);
          },
          minor_id:function(text){
            $("#MinorId > span.badge").text(text);
          },
          pdnip:function(text){
            $("#PdnIp > span.badge").text(text);
          },
          status:function(text){
            if(text === "idle"){
              $("#MinorStatus > span.badge").text("离线").attr("class","badge badge-warning");
            }
            else if(text === "busy"){
              $("#MinorStatus > span.badge").text("在线").attr("class","badge badge-success");
            }
          }
        }

      }
    };

    if(ResType ==="auto" && SubType ==="sim"){

      $("#TaskInfoList").append($('<li class="list-group-item" id="CodePath">代码路径<span class="badge codepath"></span></li>'))
        .append($('<li class="list-group-item" id="Rev">Revision<span class="badge"></span></li>'));

      InfoHandler.TaskInfoHandler.code_path = function(codepath){
        $("#CodePath > span.badge").text(codepath);
        //TODO:实时展示运行步骤
      };
      InfoHandler.TaskInfoHandler.revision = function(revision){
        $("#Rev > span.badge").text(revision);
        //TODO:实时展示运行步骤
      };
    }
    else if(ResType ==="auto" && SubType ==="real"){
      $("#TaskInfoList").append($('<li class="list-group-item" id="BinFile">bin包<span class="badge"></span></li>'))

      InfoHandler.TaskInfoHandler.bin_file = function(bin_file){
        if(typeof(bin_file) === "string"){
          $("#BinFile > span.badge").text(bin_file.slice(bin_file.lastIndexOf("/")+1));
        }

        //TODO:实时展示运行步骤
      };
    }

    if(TaskStatus.task.resource.major_id !=null && TaskStatus.task.resource.minor_id !=null){
      MajorId = parseInt(TaskStatus.task.resource.major_id);
      MinorId = parseInt(TaskStatus.task.resource.minor_id);
    }
    else{
      console.log("resource id error,MajorId ="+TaskStatus.task.resource.major_id+" ,MinorId = "+TaskStatus.task.resource.minor_id);

    }
    //2016.1.25特殊处理，Status==run result=""
    if(TaskStatus.task.status ==="run"){
      TaskStatus.task.result = "";
    }

    //2016.1.26重跑功能，只针对CI资源
    if(TaskStatus.task.result ==="fail" && ResType==="auto"){
      var RerunBtn = $('<a class="btn btn-xs btn-danger" title="Rerun"><span class="glyphicon glyphicon-repeat"></span></a>');
      if(TaskStatus.task.rerun_id ===0){
        RerunBtn.click(function(e){
          $.ajax({
            type:"POST",
            url:"/front/CI/rerun/"+TaskId,
            cache:false,
            dataType:'json',
            context:this,
            contentType:'application/json;charset=UTF-8',
            success:function(Result){
              if(Result.result !==0){
                $.notify(
                  {'message':"Rerun Task:"+TaskId+"Failed,Message:"+Result.message, 'icon': "fa fa-exclamation-circle"},
                  {'type': 'danger'});
                return;
              }
              $.notify(
                {'message':"Rerun Task:"+TaskId+" Success, NewTaskID:"+Result.task_id, 'icon': "fa fa-check"},
                {'type': 'success'});
              $(this).attr("title","ReDirect").off("click").click(function(){
                $.notify(
                  {'message':"Redirect to RerunningTask:"+TaskId, 'icon': "fa fa-spinner fa-pulse"},
                  {'type': 'success'});

                setTimeout(function(){
                  window.open("TaskInfo.html?ResType=auto&TaskId="+Result.task_id,"_self");
                },1000);

              }).fadeOut(500).promise().done(function(){
                $(this).removeClass("btn-danger").addClass("btn-info").fadeIn(500).children("span").removeClass("glyphicon-repeat").addClass("glyphicon-share-alt");
              });
            },
            error: function() {
              console.log("AjaxRequest ReRunTask Error!");
            }
          });
        })
      }
      else if(TaskStatus.task.rerun_id !== 0){
        RerunBtn.removeClass("btn-danger").addClass("btn-info");
        RerunBtn.attr("title","ReDirect").children("span").removeClass("glyphicon-repeat").addClass("glyphicon-share-alt");
        RerunBtn.click(function(e){

          window.open("TaskInfo.html?ResType=auto&TaskId="+TaskStatus.task.rerun_id,"_self");
        })
      }
      $(".page-header h2").append(RerunBtn);
    }

    for(TaskItem in InfoHandler.TaskInfoHandler){
      if(InfoHandler.TaskInfoHandler.hasOwnProperty(TaskItem) && TaskStatus.task.hasOwnProperty(TaskItem)){

        InfoHandler.TaskInfoHandler[TaskItem](TaskStatus.task[TaskItem]);
      }
    }

    //处理设备信息
    DevInfo = JSON.parse(TaskStatus.task.resource_snapshot);
    for(ResItem in DevInfo){
      if(DevInfo.hasOwnProperty(ResItem) && InfoHandler.DevInfoHandler.Major.hasOwnProperty(ResItem)){
        InfoHandler.DevInfoHandler.Major[ResItem](DevInfo[ResItem]);
      }
    }
    MinorRes = DevInfo.sub_resource[MinorId - 1];
    if(MinorRes ==null || MinorRes.length===0){
      console.log("MajorId="+DevInfo.major_id+"MinorId="+MinorId+"Has no Minor Information");
      return;
    }

    for(ResItem in MinorRes){
      if(MinorRes.hasOwnProperty(ResItem) && InfoHandler.DevInfoHandler.Minor.hasOwnProperty(ResItem)){
        InfoHandler.DevInfoHandler.Minor[ResItem](MinorRes[ResItem]);
      }
    }
  }
});





