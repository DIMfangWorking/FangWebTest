/**
 * Created by Administrator on 2015/9/15.
 */
//模拟设备资源类
define(function(require){
  var SetHtmlContent = function(session,htmlContent) {
    $(session).html(htmlContent);
  };

  return{
    SetHtmlContent:SetHtmlContent
  }
});





