
define(function(require){
  var Usr = require("obj/UserObj"),
      CommonUI = require("ui/Common"),
      RealResObj = require("obj/RealResourceObj"),
      common = require('common/common');
  require("bootstrap");
  require("bootstrap-table");
  require("bootstrap_table_filter");
  require("jsgrid");
  require("bootstrap_notify");

  $(function () {
    $("#ResTab").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href"),
          TimerID = null,
          Type = "";

      switch (href){
        case "#Simres_list":
          Type = "Sim";
          break;
        case "#Realres_list":
          Type = "Real";
          break;
        case "#CIResult":
          Type = "CI";
          break;
        default :
          break;
      }
      $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
        if($.trim($(href +" tbody").html()) ===""){
          Usr.QueryResList(ResourceLoaded,Type);

          TimerID = setInterval(function(){
            Usr.QueryResList(ResourceUpdate,Type);
          }, 10000);
        }
        else{
          Usr.QueryResList(ResourceUpdate,Type);

          TimerID = setInterval(function(){
            Usr.QueryResList(ResourceUpdate,Type);
          }, 10000);
        }
      });

      $(this).children("a[data-toggle=tab]").on('hide.bs.tab', function (e) {
        $("#Log_ResHandleHistory").html("");
        $("#"+Type+"res_table").triggerHandler("RespageHide");

        clearInterval(TimerID);
      });

    });

    $("#ResTab > li:eq(0) > a").tab("show");

    function ResourceUpdate(ResType){
      var ResList = null,
          TableData = null,
          ResSection=null;

      if("Sim" === ResType) {
        ResList = Usr.GetSimResList();
        ResSection = $("#Simres_table");
      }
      else if("Real" === ResType){
        ResList = Usr.GetRealResList();
        ResSection = $("#Realres_table");
      }
      else if("CI" === ResType){
        ResList = Usr.GetCIResList();
        ResSection = $("#CIres_table");
      }
      TableData = ResSection.bootstrapTable('getData');

      UpdateTableDataStatus(TableData,ResList,ResSection);

    }

    function UpdateTableDataStatus(TableData,ResList,ResSection){

      var DataID = 0,
          RowItem = null;

      for(DataID = 0;DataID < ResList.length-1;DataID++){
        if(TableData[DataID].ID === ResList[DataID+1].ID &&
           TableData[DataID].Status !== ResList[DataID+1].Status){

            RowItem = ResSection.bootstrapTable('getRowByUniqueId', TableData[DataID].ID);

            ResSection.bootstrapTable('updateByUniqueId',
            {
              id: TableData[DataID].ID,
              row: {
                    Status: ResList[DataID+1].Status,
                    Action:UpdateActionHtml(RowItem.Action)
                   }
            });

            ResSection.find("tr[data-uniqueid="+TableData[DataID].ID+"] td:last-child a:first-child").
              fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
        }
      }

    }

    function ResourceLoaded(ResType){

      //判断模拟/真实激活状态，确定绘制哪个页面
      var ResList = [],
          CurResList = null,
          ResSection = null,
          LastClicktr = null;

      if("Sim" === ResType) {
        ResList = Usr.GetSimResList();
        ResSection = $("#Simres_table");
      }
      else if("Real" === ResType){
        ResList = Usr.GetRealResList();
        ResSection = $("#Realres_table");
      }
      else if("CI" ===ResType){
        ResList = Usr.GetCIResList();
        ResSection = $("#CIres_table");
      }
      else{
        console.log('Unknown Type of Resource');
      }

      HandleQueryResList(ResSection,ResList,ResType);

      function HandleQueryResList(ResSection,ResList,ResType){

        var ResInst = null,
            ActionBtn = $('<a class="btn btn-primary btn-xs" href="" title="begin task"><i class="glyphicon glyphicon-send"></i></a>'),
            ModifyBtn = $('<a class="btn btn-info btn-xs" href="RealResManage.html" title="Modify"><i class="glyphicon glyphicon-cog"></i></a>'),
            ActionList = [],
            ActionBtnHTMLStr = "",
            TableDataField = [];

        for(var ResItem in ResList){
          if(ResList.hasOwnProperty(ResItem)){
            ResInst = ResList[ResItem];
            if(ResType !=="CI"){
              if(ResType === "Sim"){
                ActionBtn.attr("href","TaskStart.html?ResType="+ResType+"&ResId="+ResInst.GetResId()+
                  "&MajorId="+ResInst.GetMajorId()+"&MinorId="+ResInst.GetMinorId());
              }
              else if(ResType === "Real"){
                ActionBtn.attr("href","TaskStart.html?ResType="+ResType+"&ResId="+ResInst.GetResId()+
                  "&MajorId="+ResInst.GetMajorId());
                ActionList.push(ModifyBtn[0].outerHTML);
              }

              if(ResInst.Status === "idle"){

                ActionBtn.removeAttr("disabled").removeClass("btn-danger").addClass("btn-primary");
              }
              else if(ResInst.Status === "busy" || ResInst.Status === "lost"){
                ActionBtn.attr("disabled","disabled").removeClass("btn-primary").addClass("btn-danger");
              }
              else{
                console.log("Unknown Status!!");
                return;
              }
              ActionList.unshift(ActionBtn[0].outerHTML);

              ActionBtnHTMLStr = ActionList.join('');

              ActionList = [];
              TableDataField.push({
                ID:ResInst.GetResId(),
                Name:ResInst.Name,
                Cfg:ResInst.Config,
                IP:ResInst.IP,
                Status:ResInst.Status,
                Action:ActionBtnHTMLStr
              });
            }
            else if(ResType ==="CI"){
              TableDataField.push({
                ID:ResInst.GetResId(),
                Name:ResInst.Name,
                Cfg:ResInst.Config,
                IP:ResInst.IP,
                Status:ResInst.Status
              });
            }
          }
        }
        ResSection.bootstrapTable({
          uniqueId:"ID",
          data: TableDataField

        });
        if(ResType !=="CI"){
          ResSection.find("tr:gt(0) td:last-child").off("click");
        }
        ResSection.on("click-row.bs.table",function(e,row, $el){
          var ResItem = ResList[row.ID];

          if(!$el.hasClass("warning")){
            $el.toggleClass("warning",true);
            if(LastClicktr !=null){
              LastClicktr.toggleClass("warning",false);
            }
            LastClicktr = $el;
          }
          ResItem.QueryResHistory(TaskHistoryHandler);
          ResSection.on("RespageHide",function(e){
            e.stopPropagation();
            if(LastClicktr ===null){
              return;
            }

            LastClicktr.toggleClass("warning",false);
            LastClicktr = null;
          });
        });

        $.notify(
          {'message': ResType+'Resource Loaded Successfully', 'icon': "fa fa-check"},
          {'type': 'success'});
      }

    }

    function TaskHistoryHandler(TaskHistoryResult,ResInst){
      var $Loc = $("#Log_ResHandleHistory"),
          TaskHistoryList = null,
          jsgridDataHandle = null,
          ResTypeTab = null,
          CurActiveTabHref = $("#ResTab li.active a").attr("href"),
          RealResItem = null,
          jsgridFields = null;

      if(TaskHistoryResult === null){
        $Loc.html($("<h3/>").text("Ajax return Error!"));
        setTimeout(function(){
          ResInst.QueryResHistory(TaskHistoryHandler);
        },1000);
        return;
      }
      else if(TaskHistoryResult.result !==0){
        RealResItem = Usr.GetRealResList()[1];
        ResTypeTab = ResInst.prototype.isPrototypeOf(RealResItem)?"#Simres_list":"#Realres_list";
        if(ResTypeTab === CurActiveTabHref){
          $("#Log_ResHandleHistory").html($("<h3/>").text(TaskHistoryResult.message+", Attempting to Reload"));
          setTimeout(function(){
            ResInst.QueryResHistory(TaskHistoryHandler);
          },3000);
        }
        return;
      }

      TaskHistoryList = TaskHistoryResult.task;
      if(TaskHistoryList[0].status==="run"){
        TaskHistoryList[0].result = "--";
      }

      jsgridDataHandle = {
        DataList: TaskHistoryList,
        StatusSet:[
          { Name: "", Id: 0 },
          { Name: "run", Id: 1 },
          { Name: "close", Id: 2 }
        ],
        ResultSet:[
          { Name: "", Id: 0 },
          { Name: "fail", Id: 1 },
          { Name: "success", Id: 2 }
        ],

        insertItem: function(insertingClient) {
          this.DataList.push(insertingClient);
        },

        updateItem: function(updatingClient) { },

        deleteItem: function(deletingClient) {
          var clientIndex = $.inArray(deletingClient, this.DataList);
          this.DataList.splice(clientIndex, 1);
        }

      };

      if(CurActiveTabHref ==="#CIResult"){
        //SimResource
        if(!(ResInst instanceof RealResObj)){
          for(var HisRecordIndex=0; HisRecordIndex < TaskHistoryList.length;HisRecordIndex++){
            var HistRecordCodePathItem = TaskHistoryList[HisRecordIndex].code_path,
              BranchesIndex = HistRecordCodePathItem.indexOf("branches"),
              CodebtsIndex = HistRecordCodePathItem.indexOf("codebts");
            if(BranchesIndex === -1 ||CodebtsIndex ===-1){
              continue;
            }

            TaskHistoryList[HisRecordIndex].code_path = HistRecordCodePathItem.slice(BranchesIndex+9,CodebtsIndex);

          }
          jsgridFields = [
            { name: "date",   title: "Date",    type: "text",align:"center"},
            { name: "user",   title: "Creator", type: "text",align:"center"},
            { name: "id",     title: "TaskID",  type: "number",align:"center"},
            { name: "code_path",   title: "CodePath", type: "text",align:"center",css:"codepath",width:"20%"},
            { name: "revision",   title: "Rev", type: "text",align:"center"},
            { name: "status", title: "Status",  type: "select", items: jsgridDataHandle.StatusSet, valueField: "Id", textField: "Name"},
            { name: "result", title: "Result",  type: "select", items: jsgridDataHandle.ResultSet, valueField: "Id", textField: "Name"},
            { name: "info",   title: "Info",    type: "button",filtering: false,align:"center",
              itemTemplate: function(value, item){
                return $('<input class="jsgrid-button jsgrid-mode-button jsgrid-search-mode-button">')
                  .click(function(e){
                    window.open("TaskInfo.html?ResType=auto&SubType=sim&TaskId="+item.id,"_self");
                  });
              }
            }

          ];
        }
        else{
          jsgridFields = [
            { name: "date",   title: "Date",    type: "text",align:"center"},
            { name: "user",   title: "Creator", type: "text",align:"center"},
            { name: "id",     title: "TaskID",  type: "number",align:"center"},
            { name: "status", title: "Status",  type: "select", items: jsgridDataHandle.StatusSet, valueField: "Id", textField: "Name"},
            { name: "result", title: "Result",  type: "select", items: jsgridDataHandle.ResultSet, valueField: "Id", textField: "Name"},
            { name: "info",   title: "Info",    type: "button",filtering: false,align:"center",
              itemTemplate: function(value, item){
                return $('<input class="jsgrid-button jsgrid-mode-button jsgrid-search-mode-button">')
                  .click(function(e){
                    window.open("TaskInfo.html?ResType=auto&SubType=real&TaskId="+item.id,"_self");
                  });
              }
            }

          ];
        }
        jsgridDataHandle.loadData = jsGridLoadData(true);
      }
      else{
        jsgridFields = [
          { name: "date",   title: "Date",    type: "text",align:"center"},
          { name: "user",   title: "Creator", type: "text",align:"center"},
          { name: "id",     title: "TaskID",  type: "number",align:"center"},
          { name: "status", title: "Status",  type: "select", items: jsgridDataHandle.StatusSet, valueField: "Id", textField: "Name"},
          { name: "result", title: "Result",  type: "select", items: jsgridDataHandle.ResultSet, valueField: "Id", textField: "Name"},
          { name: "info",   title: "Info",    type: "button",filtering: false,align:"center",
            itemTemplate: function(value, item){
              return $('<input class="jsgrid-button jsgrid-mode-button jsgrid-search-mode-button">')
                      .click(function(e){
                              window.open("TaskInfo.html?ResType=manual&TaskId="+item.id,"_self");
                });
            }
          }

        ];
        jsgridDataHandle.loadData = jsGridLoadData(false);
      }



      $Loc.jsGrid("reset").jsGrid({
        width:"100%",
        filtering: true,
        pageIndex: 1,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 5,
        pageButtonCount: 5,
        //自定义搜索框
        filterRowRenderer: function () {
          var Searchtr = $("<tr/>").addClass("jsgrid-filter-row"),
              grid = this,
              Index = 0;
          $.each(this.fields,function(index,field){

            if(field.type ==="text"||field.type ==="number"){
              var $input = $('<input class="form-control">');
              //filterControl是插件源代码中的对于搜索框实例(如<input><select>)的引用，搜索框的所有事件都要绑定在这个上面
              field.filterControl = $input.attr( "type",jsgridFields[Index].type).on("keyup", function(e) {
                grid.search();
              });

              $("<td/>").html($input).appendTo(Searchtr);
            }
            else if(field.type ==="select"){
              var $select = $('<select class="form-control">');
              field.filterControl = $select.attr( "type",jsgridFields[Index].type)
                                            .on("change", function(e) {
                                              grid.search();
                                            });
              //field.items包含了select中所有的选项参数
              $.each(field.items, function (Index, Item) {

                  $("<option>").attr("value", Item.Id)
                  .text(Item.Name)
                  .appendTo($select);
              });

              $("<td/>").html($select).appendTo(Searchtr);

            }
            else if(field.type ==="button"){
              var $btn = $('<input class="jsgrid-button jsgrid-delete-button">');
              //filterControl是插件源代码中的对于搜索框实例(如<input><select>)的引用，搜索框的所有事件都要绑定在这个上面
              field.filterControl = $btn.attr( "type",jsgridFields[Index].type).on("click", function(e) {
                grid.clearFilter();
              });

              $("<td/>").html($btn).appendTo(Searchtr);
            }
          });

          return Searchtr;
        },
        deleteConfirm: "确定删除？",

        controller: jsgridDataHandle,

        fields: jsgridFields
      });

      function jsGridLoadData(IsCI){
        return function(filter) {

          return $.grep(this.DataList, function(client) {
            if(client.result === "fail"){
              client.result = 1;
            }
            else if(client.result === "success"){
              client.result = 2;
            }

            if(client.status === "run"){
              client.status = 1;
            }
            else if(client.status === "close"){
              client.status = 2;
            }
            client.date = common.DateFormat(client.date);
            if(IsCI ===true){
              return (!filter.date || client.date.indexOf(filter.date) > -1)
                && (!filter.user || client.user.indexOf(filter.user) > -1)
                && (!filter.id || client.id ===filter.id)
                && (!filter.status || client.status === filter.status)
                && (!filter.result || client.result === filter.result)
                && (!filter.code_path || client.code_path.indexOf(filter.code_path) > -1)
                && (!filter.revision || client.revision.indexOf(filter.revision) > -1)
            }
            else{
              return (!filter.date || client.date.indexOf(filter.date) > -1)
                && (!filter.user || client.user.indexOf(filter.user) > -1)
                && (!filter.id || client.id ===filter.id)
                && (!filter.status || client.status === filter.status)
                && (!filter.result || client.result === filter.result)
            }

          });
        }
      }

    }

    function UpdateActionHtml(ActionHtmlContent){
      var $el = $(ActionHtmlContent),
          ellist = [];

      if($el.attr("disabled") === undefined){
        $el.removeClass("btn-primary").addClass("btn-danger").attr("disabled","disabled");
      }
      else if($el.attr("disabled") === "disabled"){
        $el.removeClass("btn-danger").addClass("btn-primary").removeAttr("disabled");
      }
      else{
        console.log("Unknown typeof ActionMode");
      }
      for(var itemIndex = 0;itemIndex < $el.length;itemIndex++){
        ellist.push($el[itemIndex].outerHTML);
      }
      return ellist.join('');
    }
  });


});
