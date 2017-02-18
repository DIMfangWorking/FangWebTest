/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery'),
      Usr = require("obj/UserObj"),
      $EnbInfoList = $("#EnbInfoList");
  require("bootstrap");
  require("jquery_ui");
  require("bootstrap-table");

  $(function(){

    $.ajax({
      type:"GET",
      url:"/front/subresource?all=1&type=bbu",
      cache:false,
      dataType:'json',
      contentType:"application/json;charset=UTF-8",
      context:this,
      success:function(eNBInfo) {
        if(eNBInfo.result !==0){
          alert(eNBInfo.message);
          return;
        }
        GenerateEnbList($EnbInfoList,eNBInfo.enblist);
      },
      error: function() {
        $EnbInfoList.html("<h1>Query EnbList Error</h1>");
        console.log("QueryEnbListError");
        return;
      }
    });

  });

  function GenerateEnbList($el,eNBInfoList) {
    var EnbInfoItem = null,
        EnbInfoItemID = null,
        columnItem = null,
        CurModule = null,
        EnbInfoHtmlList = [],
        EnbIdArr = [],
        TableData = [],
        columns = [
        {
          field:"EnbName",
          title:"EnbName",
          align:"center",
          halign:"center"

        },
        {
          field:"EnbIP",
          title:"EnbIP",
          align:"center",
          halign:"center"

        },
        {
          field:"EnbID",
          title:"EnbID",
          align:"center",
          halign:"center"

        },
        {
          field:"EnbStatus",
          title:"EnbStatus",
          align:"center",
          halign:"center"

        }
      ];


    for(EnbInfoItemID=0;EnbInfoItemID < eNBInfoList.length;++EnbInfoItemID){

      EnbInfoItem = eNBInfoList[EnbInfoItemID];
      TableData.push({
        EnbName:"Enb"+EnbInfoItemID+1,
        EnbIP:EnbInfoItem.enbIP,
        EnbID:EnbInfoItem.enbid,
        EnbStatus:EnbInfoItem.status
      });
      EnbIdArr.push(EnbInfoItem.enbid);

    }
    $el.bootstrapTable({
      uniqueId:"EnbID",
      detailView:true,
      columns:columns,
      data:TableData
    });
    $el.on("expand-row.bs.table",function(e,index, row, $detail){

      $.ajax({
        type:"GET",
        url:"/front/subresource?type=bbu&id="+EnbIdArr[index],
        cache:false,
        dataType:'json',
        contentType:"application/json;charset=UTF-8",
        context:this,
        success:function(eNBInfo) {
          if(eNBInfo.result !==0){
            alert(eNBInfo.message);
            return;
          }
          GenerateCellInfoSection($detail,eNBInfo,EnbIdArr[index]);
        },
        error: function() {
          console.log("QueryUEInfoError");
        }
      });
    });

  }

  function GenerateCellInfoSection($el,eNBInfo,enbid){
    var CellHtmlList = [],
        CellInfo = null,
        $IMSIDiv = null,
        $CellInfoRow = null,
        $IMSIListRow = null,
        $CellInfoList = $('<div class="col-md-8">\
                        <ul class="list-group" id="CellInfo">\
                        </ul>\
                      </div>'),
        $InsetSection = $CellInfoList.find("ul");

    $InsetSection.append($('<li class="list-group-item active"></li>').text("EnbID: "+enbid));

    for(var rowItemId =0;rowItemId < eNBInfo.cellinfolist.length;++rowItemId){
      CellInfo = eNBInfo.cellinfolist[rowItemId];
      $IMSIDiv = $("<div class='col-md-9'></div>");

      $IMSIListRow = $("<div class='row'></div>");

      for(var IMSIIndex=0;IMSIIndex < CellInfo.uelist.length;++IMSIIndex){
        $("<a/>").attr("href", "UERealTimeInfo.html?IMSI="+CellInfo.uelist[IMSIIndex].imsi)
          .text("*"+(CellInfo.uelist[IMSIIndex].imsi%10000))
          .appendTo($IMSIListRow);

        if((IMSIIndex+1) % 8 ===0 || IMSIIndex === CellInfo.uelist.length-1){
          $IMSIDiv.append($IMSIListRow);
          $IMSIListRow = $("<div class='row'></div>");
        }
      }

      $CellInfoRow = $('<div class="row"></div>');
      $CellInfoRow.append($('<h4 class="col-md-3"></h4>').text("Cell"+(rowItemId+1))
                  .append($("<small/>").text(CellInfo.cellid)))
          .append($IMSIDiv);


      $('<li class="list-group-item"></li>').append($CellInfoRow).appendTo($InsetSection);
    }

    $el.html($CellInfoList);



  }


  function GenerateDevTitleInfo(CurModule,Res,ResIndex){
    var ResId = "Enb"+ResIndex,
      StatusSpan = CurModule.find(".panel-title span"),
      ParaListSpan = [],
      panelBody = CurModule.find(".panel-body");

    if(Res.status === "lost"){
      StatusSpan.text("lost").toggleClass("badge-important",true);
    }
    else if(Res.status === "idle"){
      StatusSpan.text("idle").toggleClass("badge-success",true);
    }
    else if(Res.status === "busy"){
      StatusSpan.text("busy").toggleClass("badge-warning",true);
    }
    else{
      StatusSpan.text("abnormal").toggleClass("badge-inverse",true);
    }

    ParaListSpan.push('<span class="badge">'+"EpcIP:"+Res.enbIP+'</span>');

    CurModule.find("a[data-toggle=collapse]").text(ResId).attr("href","#"+ResId);
    panelBody.parent().attr("id",ResId).on('show.bs.collapse', function (e) {

      $.ajax({
        type:"GET",
        url:"/front/subresource?type=bbu&id="+Res.enbid,
        cache:false,
        dataType:'json',
        contentType:"application/json;charset=UTF-8",
        context:this,
        success:function(eNBInfo) {
          if(eNBInfo.result !==0){
            alert(eNBInfo.message);
            return;
          }
          GenerateCellInfoSection(panelBody,eNBInfo,Res.enbid);
        },
        error: function() {
          console.log("QueryUEInfoError");
        }
      });


    });
    //将设备主要参数写入title中

    StatusSpan.before(ParaListSpan.join(''));
  }


});

