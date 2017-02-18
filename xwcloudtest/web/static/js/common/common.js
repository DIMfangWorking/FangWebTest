/**
 * Created by Administrator on 2015/9/15.
 */

define(["jquery","jquery_cookie"],function($){
  var UserLogout = function(){
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/user/logout/';
    var cookie_session = 'xwsessionid';
    var cookie_name = 'username';
    var cookie_UsrObj = 'UsrObj';
    $.ajax({
      type:"POST",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      success:function(data) {
        if(data.result === 0 && data.message === 'success')
        {
          $.cookie(cookie_session, null);
          $.cookie(cookie_name, null);
          $.cookie(cookie_UsrObj, null);
        }
        else
        {
          console.log("登出失败\n" + data.result+'\n' + data.message);
        }
        location.href ="index.html"
      },
      error: function() {
        console.log("Ajax响应异常！");
      }
    });
    },
      DateFormat = function(FormatDate){
        var datetime = null,
            year = "",
            month = "",
            date = "",
            hour = "",
            minute="",
            second="";

        if(FormatDate !== null){
          datetime = new Date(FormatDate);
        }
        else{
          datetime = new Date();
        }
        year = datetime.getFullYear();
        month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
        minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
        second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();

        return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;

      };

  return {
    LogOut:UserLogout,
    DateFormat:DateFormat
  };
});