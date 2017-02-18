/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery'),
      UEIMSI = null;
  require("bootstrap");
  require("highcharts");
  require("sand_signika");
  require("jquery_getParams");
  UEIMSI = $.getURLParam('IMSI');

  /*if(UEIMSI == null){
    alert("«Î—°‘Ò÷∏∂®UE");
    window.open("RealTimeInfo.html","_self");
  }*/

  $(function(){

    $("#HeaderIMSI").text(UEIMSI);
    Highcharts.setOptions({
      global: {
        useUTC: false
      },
      credits:{
        enabled:false
      }
    });
    $.ajax({
      type:"GET",
      url:"/front/subresource?type=ue&id="+ UEIMSI +"&duration=5",
      cache:false,
      dataType:'json',
      contentType:"application/json;charset=UTF-8",
      context:this,
      success:function(InitUEInfo) {

        if(InitUEInfo.result !==0){
          alert(InitUEInfo.message);
          return;
        }

        PageInit(InitUEInfo);

      },
      error: function() {
        console.log("QueryUEInfoError");
      }
    });


    function PageInit(InitUeInfo){
      var CurTimeStrap = 0,
          ChartObj = {
            ChartHandle:{
              UlDataHandle:null,
              DlDataHandle:null,
              RsrpDataHandle:null
            },
            ChartTimer:{
              UlTimer:null,
              DlTimer:null,
              PaintTimer:null,
              CacheTimer:null
            },
            ChartCache:{
              UlDataCache:[],
              DlDataCache:[],
              RSRPDataCache:[]
            },
            ChartCfg:{
              ChartRange:30,
              PaintInterval:1000,
              CacheInterval:2000
            }
          };

      AddUeStaticInfo(InitUeInfo.staticinfo);
      CurTimeStrap = CacheData(InitUeInfo.dynamicinfo,ChartObj.ChartCache);

      $("#ThrputUl").highcharts({
        chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          events: {
            load: function() {
              // set up the updating of the chart each second
              ChartObj.ChartHandle.UlDataHandle = this.series[0];
            }
          }
        },
        title: {
          text: 'UlThroughput'
        },
        legend:{
          enabled:false
        },
        xAxis: {
          title: {
            text: 'Time(s)'
          },
          tickInterval: 5,
          minRange:30,
          minPadding:0.01
        },
        yAxis: {
          title: {
            text: 'Mbps'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },

        tooltip: {
          crosshairs: true,
          formatter: function() {
            return '<b>'+ this.series.name +'</b><br>'+
              this.x+"s" +'<br>'+
              Highcharts.numberFormat(this.y, 2);
          }
        },
        exporting: {
          enabled: false
        },
        series: [
          {
            name: 'UlThroughput',
            color:'#8085e9'
          }]
      });

      $("#ThrputDl").highcharts({
        chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          events: {
            load: function() {
              // set up the updating of the chart each second
              ChartObj.ChartHandle.DlDataHandle = this.series[0];
            }
          }
        },
        title: {
          text: 'DlThroughput'
        },
        legend:{
          enabled:false
        },
        xAxis: {
          title: {
            text: 'Time(s)'
          },
          tickInterval: 5,
          minRange:ChartObj.ChartCfg.ChartRange,
          minPadding:0.01
        },
        yAxis: {
          title: {
            text: 'Mbps'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },

        tooltip: {
          crosshairs: true,
          formatter: function() {
            return '<b>'+ this.series.name +'</b><br>'+
              this.x+"s" +'<br>'+
              Highcharts.numberFormat(this.y, 2)+"Mbps";
          }
        },
        exporting: {
          enabled: false
        },
        series: [
          {
            name: 'DlThroughput',
            color:'#f7a35c'
          }]
      });

      $("#RSRP").highcharts({
        chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          events: {
            load: function() {
              // set up the updating of the chart each second
              ChartObj.ChartHandle.RsrpDataHandle = this.series[0];
            }
          }
        },
        title: {
          text: 'RSRP'
        },
        legend:{
          enabled:false
        },
        xAxis: {
          title: {
            text: 'Time(s)'
          },
          tickInterval: 5,
          minRange:30,
          minPadding:0.01
        },
        yAxis: {
          title: {
            text: 'Mbps'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },

        tooltip: {
          crosshairs: true,
          formatter: function() {
            return '<b>'+ this.series.name +'</b><br>'+
              this.x+"s" +'<br>'+
              Highcharts.numberFormat(this.y, 2);
          }
        },
        exporting: {
          enabled: false
        },
        series: [
          {
            name: 'UlThroughput',
            color:'#8085e9'
          }]
      });

      ChartObj.ChartTimer.PaintTimer =setInterval(function() {
        AddUeDynamicInfo(ChartObj,false);

        if(ChartObj.ChartHandle.DlDataHandle.processedXData.length >=ChartObj.ChartCfg.ChartRange){
          clearInterval(ChartObj.ChartTimer.PaintTimer);
          setInterval(function() {
            AddUeDynamicInfo(ChartObj,true);
          },ChartObj.ChartCfg.PaintInterval);
        }
      },ChartObj.ChartCfg.PaintInterval);

      ChartObj.ChartTimer.CacheTimer = setInterval(function() {
        var urlpara = "/front/subresource?type=ue&id="+ UEIMSI +"&starttime="+CurTimeStrap;
        $.ajax({
          type:"GET",
          url:urlpara,
          cache:false,
          dataType:'json',
          contentType:"application/json;charset=UTF-8",
          context:this,
          success:function(UEInfo) {
            CurTimeStrap = CacheData(UEInfo.dynamicinfo,ChartObj.ChartCache);

          },
          error: function() {
            console.log("QueryUEInfoError");
          }
        });
      }, ChartObj.ChartCfg.CacheInterval);

    }


  });

  function AddUeStaticInfo(StaticInfo){
    if(StaticInfo ==null){
      console.log("No Ue StaticInfo");
      return;
    }
    if(StaticInfo.enbid !=="" && StaticInfo.enbid !== null){
      $("#EnbID").text(StaticInfo.enbid);
    }
    else{
      $("#EnbID").text("Error:No EnbID");
      return;
    }
    if(StaticInfo.cellid !=="" && StaticInfo.cellid !== null){
      $("#CellID").text(StaticInfo.cellid);
    }
    else{
      $("#CellID").text("Error:No CellID");
      return;
    }
    if(StaticInfo.pci !=="" && StaticInfo.pci !== null){
      $("#PCI").text(StaticInfo.pci);
    }
    else{
      $("#CellID").text("Error:No PCI");
      return;
    }
    if(StaticInfo.ip !=="" && StaticInfo.ip !== null){
      $("#IP").text(StaticInfo.ip);
    }
    else{
      $("#IP").text("Error:No Ip");
      return;
    }

  }

  function CacheData(DynamicInfo,Cache){

    if(DynamicInfo ==null || DynamicInfo.length===0){
      console.log("No Ue DynamicInfo");
      return;
    }

    for(var dataitem =0;dataitem < DynamicInfo.length;++dataitem){
      if(DynamicInfo[dataitem].ULThrput != null){
        Cache.UlDataCache.push(DynamicInfo[dataitem].ULThrput);
      }

      if(DynamicInfo[dataitem].DLThrput != null){
        Cache.DlDataCache.push(DynamicInfo[dataitem].DLThrput);
      }

      if(DynamicInfo[dataitem].RSRP != null){
        Cache.RSRPDataCache.push(DynamicInfo[dataitem].RSRP);
      }
    }

    return DynamicInfo[dataitem-1].time;
  }

  function AddUeDynamicInfo(ChartObj,RemoveFlag){

    var Handler = ChartObj.ChartHandle,
        CacheItem = null,
        Cache = ChartObj.ChartCache;

    for(var HandlerItem in Handler){
      if(Handler.hasOwnProperty(HandlerItem)){
        switch (HandlerItem){
          case "UlDataHandle":
            CacheItem = Cache.UlDataCache;
            break;
          case "DlDataHandle":
            CacheItem = Cache.DlDataCache;
            break;
          case "RsrpDataHandle":
            CacheItem = Cache.RSRPDataCache;
            break;
          default:
            break;

        }
        if(CacheItem.length !==0){
          Handler[HandlerItem].addPoint(CacheItem.shift(), true, RemoveFlag);
        }
        else{
          console.log("Cache:"+HandlerItem+"has no data");
        }
      }

    }

  }



  function getRandomArray(length, min, max) {
    var array = [];
    for (var i = 0; i < length; i++) {

      array.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return array[0];
  }
});

