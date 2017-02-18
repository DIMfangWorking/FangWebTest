/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery'),
      $modal = $("#UseCfgModal"),
      $table = $("#UsrTable");
  require("bootstrap");
  require("jquery_validate");
  require("bootstrap-table");

  $(function(){

    var validator = $("#UserInfo").validate({
      debug: true,
      rules: {
        username: {
          required: true,
          minlength: 5,
          maxlength: 10
        },
        password: {
          required: true,
          minlength: 5,
          maxlength: 16
        },
        confirm_password:{
          required: true,
          equalTo:"#password"
        },
        email:{
          required: true,
          email: true
        }
      },
      messages: {
        username: {
          required: '请输入用户名',
          minlength: '用户名不能小于5个字符'
        },
        password: {
          required: '请输入密码',
          minlength: '密码不能小于5个字符'
        },
        confirm_password: {
          required: '请输入密码',
          equalTo:"输入密码不一致"
        },
        email:{
          required: '请输入邮箱地址',
          email:"邮箱格式不正确"

        }
      },
      //验证通过后，才允许提交
      submitHandler:function(form){
        var Method = "",
          Url = "/front/user/",
          Name = $("#username").val(),
          Password = $("#password").val(),
          Email = $("#email").val(),
          Index = $modal.data("rowid"),
          Operation =$modal.data("action"),
          Handler = null,
          SubmitObj = null;

        switch(Operation){
          case "create":
            Method = "POST";
            SubmitObj = {
              name:Name,
              password:Password,
              email:Email
            };
            (function(UserObj){
              Handler = function(Result){
                if(Result.result !==0){
                  alert("修改用户"+Index+"信息失败 信息："+Result.message);
                  return;
                }

                $table.bootstrapTable('append', {ID:Result.user_id,Name:UserObj.name,Email:UserObj.email});
              };
            }(SubmitObj));

            break;
          case "update":
            Method = "PUT";
            SubmitObj = {
              id:Index,
              name:Name,
              password:Password,
              email:Email
            };
            (function(UserObj){
              Handler = function(Result){
                if(Result.result !==0){
                  alert("修改用户"+Index+"信息失败 信息："+Result.message);
                  return;
                }

                $table.bootstrapTable('updateByUniqueId', {id: UserObj.id, row: {ID:UserObj.id,Name:UserObj.name,Email:UserObj.email}});
              };

            }(SubmitObj));

            break;
        }
        $.ajax({
          type:Method,
          url:Url,
          cache:false,
          dataType:'json',
          data:JSON.stringify(SubmitObj),
          contentType:'application/json;charset=UTF-8',
          success:function(UserList){
            Handler(UserList);
          },
          error: function() {
            console.log("Query UserList Error!");
          }
        });
        $("#UseCfgModal").modal("hide");


      },

      errorClass:"UserVerifyError"
    });

    $("#SavCfg").click(function(){
      $("#UserInfo").submit();
    });

    $.ajax({
      type:"GET",
      url:"/front/user/list",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(UserList){
        HandleQueryUserInfo(UserList);
      },
      error: function() {
        console.log("Query UserList Error!");
      }
    });

    $("#CreateUser").click(function(){
      showModal("创建新用户",null,"create");
    });

    $modal.on('hide.bs.modal', function () {
      validator.resetForm();
      $modal.find("input").val("");
      $(this).data({id:null,actiontype:""});
    });

    function HandleQueryUserInfo(Result){

      var UserList = Result.user,
          UserInst = null,
          TableDataField = [];

      if(Result.result !=0){
        console.log("Query UserList Error,Message:"+Result.message);
        return;
      }

      for(var UserItem in UserList){
        if(UserList.hasOwnProperty(UserItem)){
          UserInst = UserList[UserItem];
          TableDataField.push({
            ID:UserInst.id,
            Name:UserInst.name,
            Email:UserInst.email
          });

        }
      }
      $("#UsrTable").bootstrapTable('load', TableDataField);
    }
  });

  function showModal(title, row,actiontype) {
    $modal.find('.modal-title').text(title);

    if(row !==null){
      $modal.data('rowid', row.ID);
      for (var name in row) {
        if(name ==="Email"){
          $("#email").val(row[name]);
        }
        else if(name ==="Name"){
          $("#username").val(row[name]);
        }
      }
    }
    $modal.modal('show');

    $modal.data("action",actiontype);

  }

  // update and delete events
  window.actionEvents = {
    'click .update': function (e, value, row) {
      showModal("用户信息修改", row,"update");
    },
    'click .remove': function (e, value, row) {
      if (confirm('确定删除用户:'+row.Name)) {
        $.ajax({
          type:"DELETE",
          url:"/front/user/"+row.ID,
          cache:false,
          dataType:'json',
          contentType:'application/json;charset=UTF-8',
          success:function(Result){
            if(Result.result ===0){
              $table.bootstrapTable("removeByUniqueId",row.ID);
            }
          },
          error: function() {
            console.log("Del User Error!");
          }
        });

      }
    }
  };


});

