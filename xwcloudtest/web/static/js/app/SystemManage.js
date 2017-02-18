/**
 * Created by Administrator on 2015/9/15.
 */


define(function(require){
  var $ = require('jquery');


  require("bootstrap");
  require("jquery_fileupload");
  require("bootstrap_notify");
  require("jquery_ui");
  require("bootstrap_tokenfield");
  require("bootstrap-table");
  require("jquery_validate");
  require("jsgrid");

  var common = require('common/common');

  $(function(){
    var $FileSelect = $("#XmlType"),
        $FileUploadSec = $("#FileUploadSection .text-info"),
        $modal =$("#SvnCfgModal"),
        $Table =$("#SvnSection"),
        SelectType = null,
        TestCaseGrpList = [],
        TestGrpName = "",
        validator = $("#CI_SvnForm").validate({
      debug: true,
      rules: {
        username: {
          required: true,
          minlength: 3,
          maxlength: 10
        },
        password: {
          required: true,
          minlength: 3,
          maxlength: 16
        },
        envtype:{
          required: true
        },
        testgrp:{
          required: true
        },
        vertype:{
          required: true
        }
      },
      messages: {
        username: {
          required: '请输入用户名',
          minlength: '用户名不能小于3个字符'
        },
        password: {
          required: '请输入密码',
          minlength: '密码不能小于3个字符'
        },
        envtype:{
          required: '请输入环境类型'

        },
        testgrp:{
          required: '请输入测试用例组'

        },
        vertype:{
          required: '请输入版本类型'

        }
      },
      //验证通过后，才允许提交
      submitHandler:function(form){
        var Method = "POST",
            EmailList = $('#EmailTotal').tokenfield("getTokens"),
            SubmitObj = {
            type:$("#EnvType").val(),
            env_type:$("#VerType").val(),
            svn_user:$("#Usr").val(),
            svn_password:$("#password").val(),
            email_notify:[],
            test_group:$("#TestGrp").val(),
            Another_Name:$("#AnotherName").val()
          },
          SubmitInfo = $modal.data("submitInfo");
        for(var EmailItem in EmailList){
          if(EmailList.hasOwnProperty(EmailItem)){
            SubmitObj.email_notify.push(EmailList[EmailItem].label);
          }

        }

        if(SubmitInfo ==null){
          console.log("SubmitInfo is null");
          return;
        }
        if(SubmitInfo.action ==="update"){
          SubmitObj["id"] = SubmitInfo.ID;
          Method = "PUT";
        }

        $.ajax({
          type:Method,
          url:"/front/system/CI/",
          cache:false,
          dataType:'json',
          data:JSON.stringify(SubmitObj),
          contentType:'application/json;charset=UTF-8',
          success:function(Result){
            var NewRowItem = null;
            if(Result.result !==0){
              alert("Submit Error: "+Result.message);
              return;
            }
            else if(Result.id ===undefined){
              NewRowItem = {
                EnvType:SubmitObj.type,
                VerType:SubmitObj.env_type,
                Usr:SubmitObj.svn_user,
                EmailList:SubmitObj.email_notify[0]+"...",
                EmailTotal:SubmitObj.email_notify,
                TestGrp:SubmitObj.test_group
              };
              $Table.bootstrapTable('updateByUniqueId',
                {
                  id: SubmitInfo.ID,
                  row: NewRowItem
                });
            }
            else if(Result.id !==null){
              NewRowItem = {
                ID:Result.id,
                EnvType:SubmitObj.type,
                VerType:SubmitObj.env_type,
                Usr:SubmitObj.svn_user,
                EmailList:SubmitObj.email_notify[0]+"...",
                EmailTotal:SubmitObj.email_notify,
                TestGrp:SubmitObj.test_group
              };
              $Table.bootstrapTable('append',NewRowItem);
            }
          } ,
          error: function() {
            console.log("Add Or Modify Error");
          }
        });
        $modal.modal("hide");


      },

      errorClass:"UserVerifyError"
    });

    $.ajax({
      type:"GET",
      url:"/front/system/CI/list",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(Result){
        var UserList = Result.system_CI,
            ParseEmail = "",
            UserInst = null,
            TableDataField = [];

        if(Result.result !=0){
          console.log("Query UserList Error,Message:"+Result.message);
          return;
        }
        else if(UserList.length ===0){
          console.log("No SvnUser");
          return;
        }
        for(var UserItem in UserList){
          if(UserList.hasOwnProperty(UserItem)){
            UserInst = UserList[UserItem];
            if(UserInst.email_notify!==null && UserInst.email_notify.length !==0){
              ParseEmail = UserInst.email_notify[0]+"...";
            }
            TableDataField.push({
              ID:UserInst.Id,
              Usr:UserInst.svn_user,
              AnotherName:UserInst.Another_Name,
              VerType:UserInst.env_type,
              EnvType:UserInst.type,
              EmailList:ParseEmail,
              EmailTotal:UserInst.email_notify.join(","),
              TestGrp:UserInst.test_group

            });

          }
        }
        $Table.bootstrapTable('load', TableDataField);
      },
      error: function() {
        console.log("Query UserList Error!");
      }
    });
    $.ajax({
      type:"GET",
      url:"/front/testgroup/list?all=1",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(Result){
        if(Result.result !==0){
          console.log("Load TestCaseGroup Error:"+Result.result);
          return;
        }
        var TestGrpList = Result.testgroup,
            $TestCaseGrp = $("#TestGrp");

        for(var TestGrpItem in TestGrpList){
          if(TestGrpList.hasOwnProperty(TestGrpItem)){
            TestGrpName = TestGrpList[TestGrpItem].name;
            $("<option/>").attr({
              value:TestGrpName,
              name:TestGrpName
            }).text(TestGrpName).appendTo($TestCaseGrp);
          }
        }

      },
      error: function() {
        console.log("Query UserList Error!");
      }
    });
    $.ajax({
      type:"GET",
      url:"/front/system/email/list",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(Result){
        if(Result.result !==0){
          console.log("Load EmailList Error:"+Result.message);
          return;
        }
        GenerateEmailManageTable(Result.email);

      },
      error: function() {
        console.log("Query UserList Error!");
      }
    });
    $.ajax({
      type:"GET",
      url:"/front/system/usrcfg",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(Result){
        if(Result.result !==0){
          console.log("Load EmailList Error:"+Result.message);
          return;
        }
        GenerateUserCfgTable(Result.user);

      },
      error: function() {
        console.log("Query UserList Error!");
      }
    });

    $("#SavCfg").click(function (e) {
      $("#CI_SvnForm").submit();
    });

    $('#EmailTotal').on('tokenfield:createtoken', function (e) {
      var data = e.attrs.value.split('|');
      e.attrs.value = data[1] || data[0];
      e.attrs.label = data[1] ? data[0] + ' (' + data[1] + ')' : data[0];
    }).tokenfield();
    $("#Create").click(function(e){
      showModal("新建",null,"create");

    });

    (function(){
      var CurFileInst = null;
      $FileSelect.change(function(e){
        switch (e.target.selectedIndex){
          //文件上传
          case 1:
            SelectType = "EI";
            $FileUploadSec.text("EI Xml文件上传");
            $("#FileUploadSection").show(500);
            ClearFileUpLoadSection();
            break;
          case 2:
            SelectType = "Xtrace";
            $FileUploadSec.text("Xtarce Xml文件上传");
            $("#FileUploadSection").show(500);
            ClearFileUpLoadSection();
            break;
        }
      });
      function GenerateFileSection(CurFileName,CurFileInst){
        var LabelId = "XmlFile",
            TextLabel = null,
            RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove"><span class="glyphicon glyphicon-trash"></span></button>');

        if(CurFileInst !==null){
          InfoFileChange(LabelId);
          return;
        }

        TextLabel = $("<p/>").attr("id",LabelId).append(RemoveBtn).append($("<span/>").text(CurFileName));
        RemoveBtn.click(function(){
          $(this).parents("p").remove();
          CurFileInst = null;
          $("#UpLoadBtn").remove();
        });

        $("#UploadFile").after(TextLabel);
      }

      function InfoFileChange(Id){
        $("#"+Id).toggleClass("text-warning").fadeOut(500).fadeIn(500)
      }

      function ClearFileUpLoadSection(){
        $("#UploadFile").nextUntil("div").remove();
        $('#UploadFile_progress .progress-bar').css(
          'width', 0
        ).text('');
        $('#UploadFile_progress').hide();
        CurFileInst = null;
      }

      $('#UploadFile').fileupload({
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#UploadFile_progress .progress-bar').css(
            'width',
            progress + '%'
          );
        },
        add: function (e, data) {
          var CurFileName = data.files[0].name,
              IsValidBinFile = (CurFileName.search(/.xml$/g) !==-1),
              btn = $('<button/>').text('上传').attr({
                'class':'btn btn-success btn-block',
                "id":"UpLoadBtn"
              });

          if(IsValidBinFile){
            GenerateFileSection(CurFileName,CurFileInst);
            CurFileInst = data;
          }
          else{
            $.notify(
              {'message': '请选择Xml文件', 'icon': "fa fa-exclamation-circle"},
              {'type': 'danger'});
            return;
          }

          if(SelectType === "EI"){


          }
          else if(SelectType === "Xtrace"){

          }

          //已有上传按钮，说明刚刚上传完毕，添加文件后删除上传按钮和进度条
          if($("#UploadFile_progress").prevAll("button").length !==0){
            $("#UpLoadBtn").remove();
            $('#UploadFile_progress .progress-bar').css(
              'width', 0
            ).text('');
            $('#UploadFile_progress').hide();
          }

          $("#UploadFile_progress").before(btn);
          btn.click(function () {
            CurFileInst.submit();
            $('#UploadFile_progress').show();
            $("#UploadFile").hide();
            $(this).attr("disabled","disabled").text('正在上传');
          });
        },
        done: function (e, data) {
          $('#UploadFile_progress .progress-bar').text("100%");
          $("#UpLoadBtn").fadeOut(500,function(){
            $(this).text("上传成功");
          }).fadeIn(500,function(){
            $("#UploadFile").show().nextAll("p").remove();
            CurFileInst = null;
          });


        }
      });
    }());

    window.actionEvents = {
      'click .update': function (e, value, row) {
        showModal("用户信息修改", row,"update");
      },
      'click .remove': function (e, value, row) {
        if (confirm('确定删除用户:'+row.Usr)) {
          $.ajax({
            type:"DELETE",
            url:"/front/system/CI/"+row.ID,
            cache:false,
            dataType:'json',
            contentType:'application/json;charset=UTF-8',
            success:function(Result){
              if(Result.result ===0){
                $Table.bootstrapTable("removeByUniqueId",row.ID);
              }
            },
            error: function() {
              console.log("Del User Error!");
            }
          });

        }
      }
    };

    function showModal(title, row,actiontype) {
      $modal.find('.modal-title').text(title);
      var FillPara = {
          Usr:"",
          password:"",
          AnotherName:"",
          EnvType:"default",
          TestGrp:"default",
          VerType:"default",
          EmailTotal:""
        },
          SubmitInfo = {
            action:actiontype
          };

      validator.resetForm();

      if(actiontype=="update"){
        FillPara = row;
        SubmitInfo["ID"] = row.ID;
      }

      for(var RowItem in FillPara){
        if(FillPara.hasOwnProperty(RowItem)){
          $("#"+RowItem).val(FillPara[RowItem]);
        }
      }
      $("#EmailTotal").tokenfield("setTokens",FillPara.EmailTotal);
      $modal.data("submitInfo",SubmitInfo);

      $modal.modal('show');
    }
    function GenerateEmailManageTable(EmailCfg){

      var jsgridDataHandle = {
         loadData: function(filter) {
           return [EmailCfg];
         },

         insertItem: function(insertingClient) {
           this.DataList.push(insertingClient);
         },

         updateItem: function(updatingClient) {
           var d = $.Deferred();
           $.ajax({
             type:"PUT",
             url:"/front/system/email/",
             cache:false,
             dataType:'json',
             data:JSON.stringify(updatingClient),
             contentType:'application/json;charset=UTF-8'
           }).done(function(result){
             if(result.result !==0){
               d.reject();
             }
             else{
               d.resolve(updatingClient);
             }
           });
            return d.promise();
         },
         deleteItem: function(deletingClient) {
           var clientIndex = $.inArray(deletingClient, this.DataList);
           this.DataList.splice(clientIndex, 1);
         }
       },
        $Loc = $("#EmailManager"),
         jsgridFields = [
        { name: "Ip",   title: "IP",    type: "text",align:"center"},
        { name: "Port",   title: "Port", type: "text",align:"center"},
        { name: "Security",     title: "Security",  type: "text",align:"center"},
        { name: "User",   title: "User", type: "text",align:"center"},
        { name: "Password",   title: "Password", type: "text",align:"center"},
        { name: "Suffix", title: "Suffix",  type: "text",align:"center"},
        {type:"control"}

      ];



      $Loc.jsGrid("reset").jsGrid({
         width:"100%",
         pageIndex: 1,
         editing:true,
         sorting: true,
         paging: true,
         autoload: true,
         pageSize: 5,
         pageButtonCount: 5,
         deleteConfirm: "确定删除？",
         controller: jsgridDataHandle,
         fields: jsgridFields
       });
     }
    function GenerateUserCfgTable(UserCfg){

      var jsgridDataHandle = null,
          DataObj = null,
          $Loc = $("#UserCfg"),
          jsgridFields = [
            { name: "ip",   title: "IP",    type: "text",align:"center"},
            { name: "Port",   title: "Port", type: "text",align:"center"},
            { name: "db_Name", title: "DB_Name",  type: "text",align:"center"},
            {type:"control"}

          ];
      switch (UserCfg.Type){
        case "mongodb":
          break;
        case "MySQL":
          break;
        case "LDAP":
          jsgridFields = [
            { name: "url",   title: "URL",    type: "text",align:"center",css:"UserCfgtd"},
            { name: "bind_dn",   title: "BindDn", type: "text",align:"center",css:"UserCfgtd"},
            { name: "password",     title: "Password",  type: "text",align:"center",css:"UserCfgtd"},
            { name: "search_base",   title: "SearchBase", type: "text",align:"center",css:"UserCfgtd"},
            { name: "connect_timeout",   title: "ConnectTimeout", type: "text",align:"center",css:"UserCfgtd"},
            { name: "idle_timeout", title: "IdleTimeout",  type: "text",align:"center",css:"UserCfgtd"},
            { name: "search_timeout", title: "SearchTimeout",  type: "text",align:"center",css:"UserCfgtd"},
            {type:"control"}];
          break;
      }

      jsgridDataHandle = {
        loadData: function(filter) {
          return [UserCfg.user_config];
        },

        insertItem: function(insertingClient) {
          this.DataList.push(insertingClient);
        },

        updateItem: function(updatingClient) {
          var d = $.Deferred();
          $.ajax({
            type:"PUT",
            url:"/front/system/usrcfg",
            cache:false,
            dataType:'json',
            data:JSON.stringify(updatingClient),
            contentType:'application/json;charset=UTF-8'
          }).done(function(result){
            if(result.result !==0){
              d.reject();
            }
            else{
              d.resolve(updatingClient);
            }
          });
          return d.promise();
        },
        deleteItem: function(deletingClient) {
          var clientIndex = $.inArray(deletingClient, this.DataList);
          this.DataList.splice(clientIndex, 1);
        }
      };
      $Loc.jsGrid("reset").jsGrid({
        width:"100%",
        pageIndex: 1,
        editing:true,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 5,
        pageButtonCount: 5,
        deleteConfirm: "确定删除？",
        controller: jsgridDataHandle,
        fields: jsgridFields
      });
    }
  });




});