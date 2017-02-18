/**
 * Created by Administrator on 2015/9/17.
 */

//用户管理类
define(function(){
  var UserInfo = function(ParaList){
    this.id = ParaList.id;
    this.name = ParaList.name;
    this.email = ParaList.email;
  };
  UserInfo.prototype = {
    Query:function(callback,UserId){

      var url = "/front/user/list";
      if(UserId !== null){
        url = "/front/user/"+UserId;
      }
      $.ajax({
        type:"GET",
        url:url,
        cache:false,
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        success:function(UserList){
          callback(UserList);
        },
        error: function() {
          console.log("Query UserList Error!");
        }
      });

    }
  };
  return UserInfo;
});
