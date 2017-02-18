/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery'),
      Usr = require("obj/UserObj"),
      $table = $("#ResList");
  require("bootstrap");
  require("jquery_ui");
  require("bootstrap-table");
  require("bootstrap_editable");

  $(function(){

    Usr.QueryResList(RealResLoadHandler,"Real");

  });

  function RealResLoadHandler(){
    var RealResList = Usr.GetRealResList(),
        MajorResTableHead = ["ID","Name","Config","IP","Status"];

    GenerateTable($table,MajorResTableHead,RealResList);
  }

  function GenerateTable($el, ThHeadList,RowItem) {
    var thItem = null,
        rowItem = null,
        columnItem = null,
        row = null,
        columns = [],
        data = [];

    for (thItem in ThHeadList) {
      if(ThHeadList.hasOwnProperty(thItem)){
        columns.push({
          field: ThHeadList[thItem],
          title: ThHeadList[thItem]
        });
      }
    }

    for (rowItem in RowItem) {
      if(RowItem.hasOwnProperty(rowItem)){
        row = {};
        for (thItem in ThHeadList) {
          if(ThHeadList.hasOwnProperty(thItem)){
            columnItem = ThHeadList[thItem];
            row[columnItem] = RowItem[rowItem][columnItem];
          }
        }
        data.push(row);
      }
    }
    $el.bootstrapTable({
      search:true,
      sortable:false,
      uniqueId:"ID",
      columns: columns,
      data: data,
      onExpandRow: function (index, row, $detail) {

        GenerateSubResSection($detail,RowItem[row.ID].MinorResList);

      }
    });
    $el.bootstrapTable('hideLoading',true);
  }

  function GenerateSubResSection($el,SubResList){
    var ParentContainer = $('<div class="panel-group" id="panel_TaskList"></div>'),
        template = $(' <div class="panel panel-default">\
                        <div class="panel-heading">\
                          <h4 class="panel-title">\
                            <a data-toggle="collapse">\
                              <span class="glyphicon glyphicon-plus EnbInfoDetail"></span>\
                              <span class="EnbDevName"></span>\
                            </a>\
                            <span class="badge pull-right EnbInfoPara"></span>\
                          </h4>\
                        </div>\
                        <div class="panel-collapse collapse">\
                          <div class="panel-body">\
                          </div>\
                        </div>\
                        </div>'),
        ResIndex = {
          BBUIndex:0,
          RRUIndex:0,
          UEIndex:0
        };

    $.each(SubResList,function(Index,Res){
      var CurModule = template.clone(),
          CurModuleBody = CurModule.find(".panel-body");
      //不展示UE信息
      if( Res.commonPara.Name === "ue"){
        return;
      }
      GenerateDevTitleInfo(CurModule,Res,ResIndex);

      //生成资源可修改表格
      GenerateParaModifyTable(CurModuleBody,Res.specificPara);

      ParentContainer.append(CurModule);

    });
    $el.html(ParentContainer);

    function GenerateDevTitleInfo(CurModule,Res,ResIndex){
      var ResName = Res.commonPara.Name,
          ResTitle = "",
          ResId = 0,
          StatusSpan = CurModule.find(".panel-title span.EnbInfoPara"),
          ParaListSpan = [],
          panelBody = CurModule.find(".panel-body");

      if(Res.commonPara.Status === "lost"){
        StatusSpan.text("离线").toggleClass("badge-important",true);
      }
      else if(Res.commonPara.Status === "idle"){
        StatusSpan.text("空闲").toggleClass("badge-success",true);
      }
      else if(Res.commonPara.Status === "busy"){
        StatusSpan.text("忙碌").toggleClass("badge-warning",true);
      }
      else{
        StatusSpan.text("异常").toggleClass("badge-inverse",true);
      }

      switch (ResName){
        case "bbu":
          ResTitle = "BBU";
          ResId = "bbu_"+ResIndex.BBUIndex;
          ParaListSpan.push('<span class="badge EnbInfoPara">'+"EnbID:"+Res.specificPara.enbID+'</span>');
          ParaListSpan.push('<span class="badge EnbInfoPara">'+"EpcIP:"+Res.specificPara.epcip+'</span>');
          ++ResIndex.BBUIndex;
          break;
        case "rru":
          ResTitle = "RRU";
          ResId = "rru_"+ResIndex.RRUIndex;
          ParaListSpan.push('<span class="badge EnbInfoPara">'+"RackNo:"+Res.specificPara.u8RackNo+'</span>');
          ParaListSpan.push('<span class="badge EnbInfoPara">'+"ShelfNo:"+Res.specificPara.u8ShelfNo+'</span>');
          ParaListSpan.push('<span class="badge EnbInfoPara">'+"SlotNo:"+Res.specificPara.u8SlotNo+'</span>');
          ++ResIndex.RRUIndex;
          break;
        case "ue":
          break;
        default :
          break;

      }
      CurModule.find("a[data-toggle=collapse]").attr("href","#"+ResId).find(".EnbDevName").text(ResTitle);
      panelBody.parent().attr("id",ResId);
      //将设备主要参数写入title中

      StatusSpan.before(ParaListSpan.join(''));
    }

    function GenerateParaModifyTable($el,Para){
      var tableTemplate = $('<table class="table table-bordered table-striped"><tbody></tbody></table>'),
          tableContent = tableTemplate.find("tbody");

      $.each(Para,function(name,val){
        var tHead = $("<td/>").text(name),
            tContent = $("<td/>").html($('<a href="#"></a>').text(val)),
            tEditable = tContent.find("a");

        tEditable.attr("id",name).editable({
          type: 'text',
          title: name
        });

        tEditable.on('save',function(e,ValObj){
          var paraName = e.target.id,
              submitObj = {};
          Para[paraName] = ValObj.submitValue;
          submitObj[paraName] = ValObj.submitValue;

          tEditable.editable("submit",{
            url: '/front/user/list',
            ajaxOptions: {
              type: 'get',
              dataType: 'json',
              data:JSON.stringify(submitObj)
            }});
        });
        tableContent.append($("<tr/>").append(tHead).append(tContent));
      });

      $el.html(tableTemplate);
      return true;
    }
  }





});

