
define(function(require){

  var common = require('common/common');
  require("bootstrap");
  require("bootstrap_table_filter");
  require("jsgrid");
  require("bootstrap_notify");

  $(function () {
    $.ajax({
      type:"GET",
      url:"/front/task/list?",
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(TaskHistoryResult){
        TaskHistoryHandler(TaskHistoryResult);
      },
      error: function() {
        TaskHistoryHandler(null);
      }
    });


    function TaskHistoryHandler(TaskHistoryResult){
      var $Loc = $("#Log_ResHandleHistory"),
          TaskHistoryList = null,
          jsgridDataHandle = null,
          jsgridFields = null;

      if(TaskHistoryResult === null){
        $("#Log_ResHandleHistory").html($("<h3/>").text("Ajax return Error!"));
        setTimeout(function(){
          $.ajax({
            type:"GET",
            url:"/front/task/list?",
            cache:false,
            dataType:'json',
            contentType:'application/json;charset=UTF-8',
            success:function(TaskHistoryResult){
              TaskHistoryHandler(TaskHistoryResult);
            },
            error: function() {
              TaskHistoryHandler(null);
            }
          });
        },1000);
        return;
      }
      else if(TaskHistoryResult.result !==0){
        $("#Log_ResHandleHistory").html($("<h3/>").text("BackEnd Return Error!"));
        setTimeout(function(){
          $.ajax({
            type:"GET",
            url:"/front/task/list?",
            cache:false,
            dataType:'json',
            contentType:'application/json;charset=UTF-8',
            success:function(TaskHistoryResult){
              TaskHistoryHandler(TaskHistoryResult);
            },
            error: function() {
              TaskHistoryHandler(null);
            }
          });
        },3000);

        return;
      }

      TaskHistoryList = TaskHistoryResult.task;

      jsgridDataHandle = {
        DataList: $.extend(true,[],TaskHistoryList),
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
        loadData: function(filter) {
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

            return (!filter.date || client.date.indexOf(filter.date) > -1)
              && (!filter.user || client.user.indexOf(filter.user) > -1)
              && (!filter.id || client.id ===filter.id)
              && (!filter.status || client.status === filter.status)
              && (!filter.result || client.result === filter.result)
          });
        },

        insertItem: function(insertingClient) {
          this.DataList.push(insertingClient);
        },

        updateItem: function(updatingClient) { },

        deleteItem: function(deletingClient) {
          var clientIndex = $.inArray(deletingClient, this.DataList);
          this.DataList.splice(clientIndex, 1);
        }

      };

      jsgridFields = [
        { name: "date",   title: "Date",    type: "text",align:"center"},
        { name: "user",   title: "Creator", type: "text",align:"center"},
        { name: "id",     title: "TaskID",  type: "number",align:"center"},
        { name: "status", title: "Status",  type: "select", items: jsgridDataHandle.StatusSet, valueField: "Id", textField: "Name"},
        { name: "result", title: "Result",  type: "select", items: jsgridDataHandle.ResultSet, valueField: "Id", textField: "Name"},
        { name: "info",   title: "Info",    type: "button",filtering: false,align:"center",
          itemTemplate: function(value, item){
            return $('<input class="jsgrid-button jsgrid-mode-button jsgrid-search-mode-button">').click(function(e){window.open("TaskInfo.html?TaskId="+item.id,"_self");});
          }
        }

      ];

      $Loc.jsGrid("reset").jsGrid({
        width:"100%",
        filtering: true,
        pageIndex: 1,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,
        //自定义搜索框
        filterRowRenderer: function () {
          var Searchtr = $("<tr/>").addClass("jsgrid-filter-row"),
              grid = this;
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
