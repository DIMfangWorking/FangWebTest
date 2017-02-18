/**
 * Created by Administrator on 2015/9/15.
 */


define(function(require){
  var SimRes = require("obj/SimResourceObj"),
      RealRes = require("obj/RealResourceObj"),
      Usr = require("obj/UserObj"),
      $ = require('jquery');

  require("jquery_getParams");
  require("jquery_fileupload");
  require("bootstrap");
  require("bootstrap-table");
  require("jquery_tinyscrollbar");
  require("highcharts");
  require("sand_signika");
  require("TimeCircles");
  require("bootstrap_progressbar");
  require("bootstrap_notify");

  var ResId = $.getURLParam('ResId'),
      ResType = $.getURLParam('ResType'),
      MajorId = $.getURLParam('MajorId'),
      MinorId = $.getURLParam('MinorId'),
      common = require('common/common');

  Usr.Query(TestCaseGrpLoaded,"TestCaseGrp");

  $(function(){
    var Res = null,
        UpLoadSuccessFlag = false,
        CellSelectorDOM = [ $("#CellSelector input:eq(0)"),
                            $("#CellSelector input:eq(1)"),
                            $("#CellSelector input:eq(2)")],
        EIInfoDOM = {
          CellInfo:{
            GenericCfg:{
              u32EnbId:$("#eNBID"),
              u8CellID:$("#CellID"),
              u32CellCenterFreq:$("#CenterFreq"),
              u16CellPCI:$("#PCI"),
              u8CellBandWidth:$("#BandWidth"),
              u8CellULDLConfig:$("#UlDlCfg"),
              u8CellSpecSubFramCfg:$("#SpecSFCfg"),
              u8CellULAntNum:$("#UlAntNum"),
              u8CellDLAntNum:$("#DlAntNum")
            },
            GeneralState:{
              u16SFN:$("#SFN"),
              u16ActiveUENum:$("#ActiveUENum"),
              ConnectUENum:$("#ConnectUENum"),
              s16NI:$("#NI"),
              u8TXPower:$("#TXPower")
            },
            DetailState_Ul:{
              u32ULMacThrput:$("#ULMacThrput"),
              u32ULPdcpThrput:$("#UlPdcpThrput"),
              u8ULRbRatio:$("#ULRbRatio"),
              u8ULAvrgShdUEForTTI:$("#ULAvrgShdUEPerTTI"),
              u8ULAvrgHarqCnt:$("#ULAvrgHarqCnt"),
              u8ULAvrgBler:$("#ULAvrgBler"),
              u16ULHarqFailRatio:$("#ULHarqFailRatio"),
              u16ULHarqExpireRatio:$("#ULHarqExpireRatio"),
              u16ULAvrgMcs:$("#ULAvrgMcs"),
              u16ULMaxSchdMcs:$("#ULMaxSchdMcs"),
              u16ULHqRetSuccRate1:$("#UlHqRetSuccRatio1"),
              u16ULHqRetSuccRate2:$("#UlHqRetSuccRatio2"),
              u16ULHqRetSuccRate3:$("#UlHqRetSuccRatio3"),
              u16ULHqRetSuccRate4:$("#UlHqRetSuccRatio4")
            },
            DetailState_Dl:{
              u32DLMacThrput:$("#DLMacThrput"),
              u32DLPdcpThrput:$("#DlPdcpThrput"),
              u8DLRbRatio:$("#DLRbRatio"),
              u8DLAvrgShdUEForTTI:$("#DLAvrgShdUEPerTTI"),
              u8DLAvrgHarqCnt:$("#DLAvrgHarqCnt"),
              u8DLAvrgBler:$("#DLAvrgBler"),
              u16DLHarqFailRatio:$("#DLHarqFailRatio"),
              u16DLHarqExpireRatio:$("#DLHarqExpireRatio"),
              u16DLAvrgMcs:$("#DLAvrgMcs"),
              u16DtxRatio:$("#DtxRatio"),
              u8TXDivTMRatio:$("#TXDivTMRatio"),
              u8TxCddRatio:$("#TxCddRatio"),
              u16DLMaxSchdMcs:$("#DLMaxSchdMcs"),
              u16DLHqRetSuccRatio1:$("#DlHqRetSuccRatio1"),
              u16DLHqRetSuccRatio2:$("#DlHqRetSuccRatio2"),
              u16DLHqRetSuccRatio3:$("#DlHqRetSuccRatio3"),
              u16DLHqRetSuccRatio4:$("#DlHqRetSuccRatio4")
            }
          },
          UEInfo:{
            u8PL:"PL",
            u8TxDivRatio:"TXDiv",
            u32UEGid:"GID",
            u32ULPdcpThrput:"UlPdcpTput",
            u32DLPdcpThrput:"DlPdcpTput",
            u32IP:"IP",
            u32ULMacThrput:"UlMacTput",
            u32DLMacThrput:"DlMacTput",
            u16ULSchdCnt:"UlShdCnt",
            u16DLSchdCnt:"DlShdCnt",
            u16ULHarqFailRatio:"UlHarqFail",
            u16DLHarqFailRatio:"DlHarqFail",
            u16ULHarqExpireRatio:"UlHarqExpire",
            u16DLHarqExpireRatio:"DlHarqExpire",
            u16ULAvrgMcs:"UlMcs",
            u16DLAvrgMcs:"DlMcs",
            u8ULAvrgHarqTxCnt:"UlHarqCnt",
            u8DLAvrgHarqTxCnt:"DlHarqCnt",
            u16ULAvrgRbNum:"UlRbNum",
            u16DLAvrgRbNum:"DlRbNum",
            u8ULAvrgBler:"UlBler",
            u8DLAvrgBler:"DlBler",
            u16DtxRatio:"DTX"
          }
        },
        VerSubmitObj = null;

    if(ResType == null || ResId == null || MajorId == null){
      alert('请选择测试设备');
      window.open("homepage.html","_self");
    }

    VerSubmitObj = ModifySubmitObject(ResType,false);

    if(ResType === "Real"){
      Res = new RealRes({ID:ResId,major_id:MajorId});
    }
    else if(ResType === "Sim"){
      Res = new SimRes({ID:ResId,major_id:MajorId,minor_id:MinorId});
      $("#FileUploadSection blockquote .text-info").text("请选择lte_app lte.db").next().text("临时版本").append($("<cite/>").text("lte_app lte.db"));
    }

    $("#VerUploadType").change(function(e){
      switch (e.target.selectedIndex){
        //文件上传
        case 1:
          $("#URLInputSection").hide();
          $("#FileUploadSection").show(1000);
          break;
        case 2:
          $("#FileUploadSection").hide();
          $("#URLInputSection").show(1000);
          break;
      }
    });

    $("#Log_TaskStatus").tinyscrollbar();

    $('#BeginTest').click(function(){
      var TestCaseGrpList = null,
          URLContent = $.trim($("#URLInputSection input").val()),
          SubmitPara = {TestGrpName:"",VerSubmitObj:{}},
          UploadType = $("#VerUploadType").children("option:selected").index();

      if($('#TestCaseGrpSection_body input:checked').val() == null){
        $('#TestCaseGrpSection').removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        $.notify({
          icon: 'fa fa-exclamation-circle',
          message: "请选择测试用例组"
        });
        return;
      }
      else if(UploadType ===0){
        $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        $.notify({
          icon: 'fa fa-exclamation-circle',
          message: "请选择版本上传方式"
        });
        return;
      }
      else if(UploadType===1){
        if(UpLoadSuccessFlag === false){
          $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
          $.notify({
            icon: 'fa fa-exclamation-circle',
            message: "请上传版本文件"
          });
          return;
        }
        UpLoadSuccessFlag = false;

      }
      else if(UploadType===2){
        var IsValidURL = (URLContent.indexOf("ftp://") ===0);
        if(IsValidURL != true){
          $("#URLInputSection .input-group").toggleClass("has-error",true);
          $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
          $.notify({
            icon: 'fa fa-exclamation-circle',
            message: "请输入合法的URL ftp://"
          });
          return;
        }
        else{
          $("#URLInputSection .input-group").toggleClass("has-error",false);
          VerSubmitObj = ModifySubmitObject(ResType,true);
          VerSubmitObj.url = URLContent;
          $("#URLInputSection input").val("");
        }
      }


      FillSubmitPara(SubmitPara,VerSubmitObj);

      Res.CreateTask(SubmitPara,CreateTaskHandle);

      function FillSubmitPara(SubmitPara,SrcVerSubmitPara){
        var TestGrpId = null;

        SubmitPara.TestGrpName = GetCurTestCaseGrpName();

        for(var item in SrcVerSubmitPara){
          if(SrcVerSubmitPara.hasOwnProperty(item)){
            switch (item){
              case "lte_app":
                SubmitPara.VerSubmitObj.exe_file = SrcVerSubmitPara[item];
                break;
              case "lte_db":
                SubmitPara.VerSubmitObj.db_file = SrcVerSubmitPara[item];
                break;
              case "bin":
                SubmitPara.VerSubmitObj.exe_file = SrcVerSubmitPara[item];
                break;
              case "url":
                SubmitPara.VerSubmitObj.url = SrcVerSubmitPara[item];
                break;
              default :
                break;
            }
          }

        }
    }

    });

    $("#TaskTimer").TimeCircles({ time: { Days: { show: false }, Hours: { show: false } }});

    (function(){
      var FileOperationList = $.extend(true,{},VerSubmitObj),
          UpLoadedFiles = 0;
      function GenerateFileSection(CurFileName,FileOperationList){
        var TextLabel = null,
            FillPara = null,
            LabelId = "",
            RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove"><span class="glyphicon glyphicon-trash"></span></button>');

        if(CurFileName === "lte_app" ){
          FillPara = FileOperationList.lte_app;
          LabelId = "lte_app";
        }
        else if(CurFileName === "lte.db" ){
          FillPara = FileOperationList.lte_db;
          LabelId = "lte_db";
        }
        else{
          FillPara = FileOperationList.bin;
          LabelId = "bin";
        }

        if(FillPara !==null){
          InfoFileChange(LabelId);
          return;
        }

        TextLabel = $("<p/>").attr("id",LabelId).append(RemoveBtn).append($("<span/>").text(CurFileName));
        (function(LabelId){
          RemoveBtn.click(function(){
            $(this).parents("p").remove();
            FileOperationList[LabelId] = null;
            $("#UpLoadBtn").remove();
          });
        }(LabelId));

        $("#UploadFile").after(TextLabel);
      }
      function InfoFileChange(Id){
        $("#"+Id).toggleClass("text-warning").fadeOut(500).fadeIn(500)
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
          var FileList = data.originalFiles,
              CurFileName = data.files[0].name,
              btn = $('<button/>').text('上传').attr({
                'class':'btn btn-success btn-block',
                "id":"UpLoadBtn"
              });

          if(ResType === "Real"){
            var IsValidBinFile = (CurFileName.search(/.BIN$/g) !==-1);

            if(IsValidBinFile){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.bin = data;
            }
          }
          else if(ResType === "Sim"){
            if(CurFileName === "lte_app" ){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.lte_app = data;
            }
            else if(CurFileName === "lte.db"){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.lte_db = data;
            }
          }

          //已有上传按钮，说明刚刚上传完毕，添加文件后删除上传按钮和进度条
          if($("#UploadFile_progress").prevAll("button").length !==0){
            $("#UpLoadBtn").remove();
            $('#UploadFile_progress .progress-bar').css(
              'width', 0
            ).text('');
            $('#UploadFile_progress').hide();
          }


          //当前文件是文件列表的最后一个文件
          if(CurFileName === FileList[FileList.length-1].name){
            for(var item in FileOperationList){
              if(FileOperationList.hasOwnProperty(item) && FileOperationList[item] === null){
                alert("请选择"+item);
                return;
              }
            }

            $("#UploadFile_progress").before(btn);
            btn.click(function () {
              for(var item in FileOperationList){
                if(FileOperationList.hasOwnProperty(item)){
                  FileOperationList[item].submit();
                }
              }
              $('#UploadFile_progress').show();
              $("#UploadFile").hide();
              $(this).attr("disabled","disabled").text('正在上传');
            });

          }
        },
        done: function (e, data) {
          var SucceedInfo = "";

          if(ResType === "Real"){
            VerSubmitObj.bin = data.result.file;
            SucceedInfo = "版本包上传成功";
            UpLoadedFiles = 2;
          }
          else if(ResType === "Sim"){
            SucceedInfo = "lte_app lte.db 上传成功";
            UpLoadedFiles+=1;

            switch (data.files[0].name){
              case "lte.db":
                VerSubmitObj.lte_db = data.result.file;
                break;
              case "lte_app":
                VerSubmitObj.lte_app = data.result.file;
                break;
              default :
                break;
            }

          }
          if(UpLoadedFiles === 2){
            $('#UploadFile_progress .progress-bar').text("100%");
            $("#UpLoadBtn").fadeOut(500,function(){
              $(this).text(SucceedInfo);
            }).fadeIn(500,function(){
              $("#UploadFile").show().nextAll("p").remove();
              for(var item in FileOperationList){
                if(FileOperationList.hasOwnProperty(item)){
                  FileOperationList[item] = null;
                }
              }
              UpLoadedFiles = 0;
              UpLoadSuccessFlag = true;
            });
          }


        }
      });
    }());

    //TestAjax();
    function GetCurTestCaseGrpName(){
      var TestGrpId = null,
          TestCaseGrpList = null;
      TestGrpId = $('#TestCaseGrpSection_body input:checked').attr("id");
      TestGrpId = TestGrpId.slice(TestGrpId.indexOf("_")+1);
      TestCaseGrpList = Usr.GetTestCaseGrpList();
      return  TestCaseGrpList[TestGrpId].Name;
    }

    function TestEI(taskid){
      var CurEIData = null,
        TimerInterval = 1000,
        EITimerID = null,
        callbacklist = {
          DrawUeInfo:null,
          DrawCellInfo:null,
          DrawNIInfo:DrawNICharts
        },
        CellId = null;

      $("#StateTab a[href=#EISection]").on('shown.bs.tab', function (e) {
        AdjustChartsHeight();
        callbacklist.DrawNIInfo = DrawNICharts;
        $.ajax({
          type:"GET",
          url:"/front/task/eibasic/"+taskid,
          cache:false,
          dataType:'json',
          contentType:'application/json;charset=UTF-8',
          success:function(Result){
            if(Result.result !==0){
              alert(Result.message);
              return;
            }

            CurEIData = Result.ei_basic;
            //TODO:缓存当前CellID，请求成功后检查携带的CellID与缓存值的不同，若不同，触发小区CellId更新事件
            if(CurEIData ==null){
              console.log("NO EI Basic Message");
              return;
            }
            InitEICellInfo(CurEIData);
            CellId = $("#CellSelector input:checked").val();
            if(CellId !==null){
              InitEIUeInfo(CurEIData[CellId].ueGeneralList.ueDict);
              UpdateEIData(CurEIData[CellId]);
            }

            EITimerID = setInterval(function(){
              $.ajax({
                type:"GET",
                url:"/front/task/eibasic/"+taskid,
                cache:false,
                dataType:'json',
                contentType:'application/json;charset=UTF-8',
                success:function(Result){
                  var Handler = null;

                  if(Result.result !==0){
                    alert(Result.message);
                    return;
                  }

                  CurEIData = Result.ei_basic;
                  if(CurEIData ==null){
                    console.log("NO EI Basic Message");
                    return;
                  }
                  InitEICellInfo(CurEIData);
                  CellId = $("#CellSelector input:checked").val();
                  if(CellId !==null){
                    UpdateEIData(CurEIData[CellId]);
                  }
                  for(var Item in callbacklist){
                    if(callbacklist.hasOwnProperty(Item)){
                      Handler = callbacklist[Item];
                      if(Handler !==null){
                        Handler(CurEIData[CellId]);
                      }

                    }
                  }
                },
                error: function() {
                  console.log("QueryEiBasicInfo Error!");
                }
              });
            },TimerInterval);
          },
          error: function() {
            console.log("QueryEiBasicInfo Error!");
          }
        });
      });

      $("#StateTab a[href=#EISection]").on('hiden.bs.tab', function (e) {
        if(EITimerID !==null){
          clearInterval(EITimerID);
        }
        DestroyCharts(callbacklist);
      });



      $("#CellSelector input").change(function(e){
        CellId = e.currentTarget.value;
        if(CellId !==null) {
          UpdateEIData(CurEIData[CellId]);
          DestroyCharts(callbacklist);
        }
        else{
          console.log("CellId is null");
        }


      });

      $("#EiCellInfoSelector").change(function(e){
        var UeInfoPara = e.target.value,
          ParaText = $(this).find("option:selected").text();

        $("#EiCellInfoChart").data("CellInfo", {CellId:CellId,Para:UeInfoPara,ParaText:ParaText});
        DrawCellInfoCharts(CurEIData[CellId],true);

        if(callbacklist.DrawCellInfo ===null){
          callbacklist.DrawCellInfo = DrawCellInfoCharts;
        }
      });

      $("#EiUeGidSelector").focus(function(e){
        var UeGidList = [],
          Gid = null;

        TableData = $("#UEInfoTable").bootstrapTable('getData');
        for(var Ueitem=0; Ueitem < TableData.length;Ueitem++){
          Gid = TableData[Ueitem].GID;
          if($(this).find("option[value="+Gid+"]").length !==0){
            continue;
          }
          UeGidList.push($("<option/>").text(Gid).val(Gid)[0].outerHTML);
        }
        $(this).append(UeGidList.join(''));
      });

      $("#EiUeGidSelector").change(function(e){
        var UeGid = e.target.value,
          $UeInfoChart =  $('#EiUeInfoChart').highcharts(),
          UeInfoSaved = $("#EiUeInfoChart").data("UEInfo");
        if(UeInfoSaved !==undefined){
          UeInfoSaved.Gid = UeGid;
          if($UeInfoChart !=null){
            $UeInfoChart.setTitle(null, { text: 'Gid:'+UeGid});
          }

        }
        else{
          UeInfoSaved  = {Gid:UeGid}
        }
        $("#EiUeInfoChart").data("UEInfo",UeInfoSaved);
        $("#EiUeInfoSelector").show(500);

      });

      $("#EiUeInfoSelector").change(function(e){
        var UeInfoPara = e.target.value,
          UeInfoSaved = $("#EiUeInfoChart").data("UEInfo"),
          ParaText = $(this).find("option:selected").text();

        $("#EiUeInfoChart").data("UEInfo", $.extend({},UeInfoSaved,{Para:UeInfoPara,ParaText:ParaText}));
        DrawUeInfoCharts(CurEIData[CellId],true);

        if(callbacklist.DrawUeInfo ===null){
          callbacklist.DrawUeInfo = DrawUeInfoCharts;
        }
      });
    }

    function TestAjax(){
      var CurEIData = null,
        TimerInterval = 1000,
        Result = {
          "result": 0,
          "message": "success",
          "ei_basic" : {
            "254":{
              "u8OpticPort":"8",
              "cellGeneralCfg" : {
                "u8CellID":"254",
                "u32EnbId":"4250",
                "u32CellCenterFreq":"65350",
                "u16CellPCI":"189",
                "u8CellBandWidth":"5M",
                "u8CellULDLConfig":"1",
                "u8CellSpecSubFramCfg":"7",
                "u8CellULAntNum":"4",
                "u8CellDLAntNum":"1"
              },
              "cellGeneralState" : {
                "u16SFN":"1032",
                "u16ActiveUENum":"1500",
                "s16NI":"-600dbm",
                "u8TXPower":"80dbm"
              },
              "cellULDetailState" : {
                "u32ULMacThrput":"10M",
                "u32ULPdcpThrput":"10M",
                "u8ULRbRatio":"10%",
                "u8ULAvrgShdUEForTTI":"14.1",
                "u8ULAvrgHarqCnt":"1.0",
                "u8ULAvrgBler":"10%",
                "u16ULHarqFailRatio":"10%",
                "u16ULHarqExpireRatio":"10%",
                "u16ULAvrgMcs":"20",
                "u16ULMaxSchdMcs":"30",
                "u16ULHqRetSuccRate1":"10000%%",
                "u16ULHqRetSuccRate2":"10000%%",
                "u16ULHqRetSuccRate3":"10000%%",
                "u16ULHqRetSuccRate4":"10000%%",
                "s16NiRB":[-468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454, -453, -452, -451, -450, -449, -448, -447, -446, -445, -444, -443, -442, -441, -440, -439, -468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454, -453, -452, -451, -450, -449, -448, -447, -446, -445, -444, -443, -442, -441, -440, -439, -468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454]
              },
              "cellDLDetailState" : {
                "u32DLMacThrput":"10M",
                "u32DLPdcpThrput":"10M",
                "u8DLRbRatio":"10%",
                "u8DLAvrgShdUEForTTI":"14.1",
                "u8DLAvrgHarqCnt":"1.0",
                "u8DLAvrgBler":"10%",
                "u16DLHarqFailRatio":"10%",
                "u16DLHarqExpireRatio":"10%",
                "u16DLAvrgMcs":"24",
                "u16DtxRatio":"1000%%",
                "u8TXDivTMRatio":"20%",
                "u8TxCddRatio":"20%",
                "u16DLMaxSchdMcs":"30",
                "u16DLHqRetSuccRatio1":"10000%%",
                "u16DLHqRetSuccRatio2":"10000%%",
                "u16DLHqRetSuccRatio3":"10000%%",
                "u16DLHqRetSuccRatio4":"10000%%"
              },
              "ueGeneralList":{
                "u32UENum":"1500",
                "ueDict":{
                  "2041":{
                    "ueGid":"2041",
                    "u8PL":"106db",
                    "u8TxDivRatio":"80%",
                    "u32ULPdcpThrput":"20M",
                    "u32DLPdcpThrput":"20M",
                    "u32IP":"172.31.5.106",
                    "u32ULMacThrput":"20M",
                    "u32DLMacThrput":"20M",
                    "u16ULSchdCnt":"80",
                    "u16DLSchdCnt":"80",
                    "u16ULHarqFailRatio":"50%",
                    "u16DLHarqFailRatio":"50%",
                    "u16ULHarqExpireRatio":"50%",
                    "u16DLHarqExpireRatio":"50%",
                    "u16ULAvrgMcs":"23",
                    "u16DLAvrgMcs":"23",
                    "u8ULAvrgHarqTxCnt":"100",
                    "u8DLAvrgHarqTxCnt":"200",
                    "u16ULAvrgRbNum":"80",
                    "u16DLAvrgRbNum":"80",
                    "u8ULAvrgBler":"50%",
                    "u8DLAvrgBler":"50%",
                    "u16DtxRatio":"70%%"
                  },
                  "2042":{
                    "ueGid":"2042",
                    "u8PL":"106db",
                    "u8TxDivRatio":"80%",
                    "u32ULPdcpThrput":"20M",
                    "u32DLPdcpThrput":"20M",
                    "u32IP":"172.31.5.106",
                    "u32ULMacThrput":"20M",
                    "u32DLMacThrput":"20M",
                    "u16ULSchdCnt":"80",
                    "u16DLSchdCnt":"80",
                    "u16ULHarqFailRatio":"50%",
                    "u16DLHarqFailRatio":"50%",
                    "u16ULHarqExpireRatio":"50%",
                    "u16DLHarqExpireRatio":"50%",
                    "u16ULAvrgMcs":"23",
                    "u16DLAvrgMcs":"23",
                    "u8ULAvrgHarqTxCnt":"100",
                    "u8DLAvrgHarqTxCnt":"200",
                    "u16ULAvrgRbNum":"80",
                    "u16DLAvrgRbNum":"80",
                    "u8ULAvrgBler":"50%",
                    "u8DLAvrgBler":"50%",
                    "u16DtxRatio":"70%%"
                  }
                }
              }
            },
            "253":{
              "u8OpticPort":"8",
              "cellGeneralCfg" : {
                "u8CellID":"253",
                "u32EnbId":"4250",
                "u32CellCenterFreq":"1890.4M",
                "u16CellPCI":"180",
                "u8CellBandWidth":"5M",
                "u8CellULDLConfig":"1",
                "u8CellSpecSubFramCfg":"7",
                "u8CellULAntNum":"4",
                "u8CellDLAntNum":"1"
              },
              "cellGeneralState" : {
                "u16SFN":"1032",
                "u16ActiveUENum":"1500",
                "s16NI":"-600dbm",
                "u8TXPower":"80dbm"
              },
              "cellULDetailState" : {
                "u32ULMacThrput":"10M",
                "u32ULPdcpThrput":"10M",
                "u8ULRbRatio":"10%",
                "u8ULAvrgShdUEForTTI":"14.1",
                "u8ULAvrgHarqCnt":"1.0",
                "u8ULAvrgBler":"10%",
                "u16ULHarqFailRatio":"10%",
                "u16ULHarqExpireRatio":"10%",
                "u16ULAvrgMcs":"20",
                "u16ULMaxSchdMcs":"30",
                "u16ULHqRetSuccRate1":"10000%%",
                "u16ULHqRetSuccRate2":"10000%%",
                "u16ULHqRetSuccRate3":"10000%%",
                "u16ULHqRetSuccRate4":"10000%%",
                "s16NiRB":[-468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454, -453, -452, -451, -450, -449, -448, -447, -446, -445, -444, -443, -442, -441, -440, -439, -468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454, -453, -452, -451, -450, -449, -448, -447, -446, -445, -444, -443, -442, -441, -440, -439, -468, -467, -466, -465, -464, -463, -462, -461, -460, -459, -458, -457, -456, -455, -454]
              },
              "cellDLDetailState" : {
                "u32DLMacThrput":"10M",
                "u32DLPdcpThrput":"10M",
                "u8DLRbRatio":"10%",
                "u8DLAvrgShdUEForTTI":"14.1",
                "u8DLAvrgHarqCnt":"1.0",
                "u8DLAvrgBler":"10%",
                "u16DLHarqFailRatio":"10%",
                "u16DLHarqExpireRatio":"10%",
                "u16DLAvrgMcs":"24",
                "u16DtxRatio":"1000%%",
                "u8TXDivTMRatio":"20%",
                "u8TxCddRatio":"20%",
                "u16DLMaxSchdMcs":"30",
                "u16DLHqRetSuccRatio1":"10000%%",
                "u16DLHqRetSuccRatio2":"10000%%",
                "u16DLHqRetSuccRatio3":"10000%%",
                "u16DLHqRetSuccRatio4":"10000%%"
              },
              "ueGeneralList":{
                "u32UENum":"1500",
                "ueDict":{
                  "2049":{
                    "ueGid":"2049",
                    "u8PL":"106db",
                    "u8TxDivRatio":"80%",
                    "u32ULPdcpThrput":"20M",
                    "u32DLPdcpThrput":"20M",
                    "u32IP":"172.31.5.106",
                    "u32ULMacThrput":"20M",
                    "u32DLMacThrput":"20M",
                    "u16ULSchdCnt":"80",
                    "u16DLSchdCnt":"80",
                    "u16ULHarqFailRatio":"50%",
                    "u16DLHarqFailRatio":"50%",
                    "u16ULHarqExpireRatio":"50%",
                    "u16DLHarqExpireRatio":"50%",
                    "u16ULAvrgMcs":"23",
                    "u16DLAvrgMcs":"23",
                    "u8ULAvrgHarqTxCnt":"100",
                    "u8DLAvrgHarqTxCnt":"200",
                    "u16ULAvrgRbNum":"80",
                    "u16DLAvrgRbNum":"80",
                    "u8ULAvrgBler":"50%",
                    "u8DLAvrgBler":"50%",
                    "u16DtxRatio":"70%%"
                  }
                }
              }
            }
          }
        },
        callbacklist = {
          DrawUeInfo:null,
          DrawCellInfo:null,
          DrawNIInfo:null
        },
        TableData = null,
        CellId = null;

      if(Result.result !==0){
        alert(Result.message);
        return;
      }
      $("#StateTab a[href=#EISection]").on('shown.bs.tab', function (e) {
        AdjustChartsHeight();
        callbacklist.DrawNIInfo = DrawNICharts;
      });


      CurEIData = Result.ei_basic;
      //TODO:缓存当前CellID，请求成功后检查携带的CellID与缓存值的不同，若不同，触发小区CellId更新事件
      InitEICellInfo(CurEIData);
      CellId = $("#CellSelector input:checked").val();
      InitEIUeInfo(CurEIData[CellId].ueGeneralList.ueDict);
      if(CellId !==null){
        UpdateEIData(CurEIData[CellId]);
      }

      setInterval(function(){
        var Handler = null;
        if(Result.result !==0){
          alert(Result.message);
          return;
        }

        CurEIData = Result.ei_basic;
        CurEIData[CellId].cellGeneralState.u16SFN = (parseInt(CurEIData[CellId].cellGeneralState.u16SFN)+1)%1024;
        //TODO:缓存当前CellID，请求成功后检查携带的CellID与缓存值的不同，若不同，触发小区CellId更新事件
        InitEICellInfo(CurEIData);
        CellId = $("#CellSelector input:checked").val();
        if(CellId !==null){
          UpdateEIData(CurEIData[CellId]);
        }

        for(var Item in callbacklist){
          if(callbacklist.hasOwnProperty(Item)){
            Handler = callbacklist[Item];
            if(Handler !==null){
              Handler(CurEIData[CellId]);
            }
          }
        }

      },TimerInterval);

      $("#CellSelector input").change(function(e){
        CellId = e.currentTarget.value;
        if(CellId !==null) {
          UpdateEIData(CurEIData[CellId]);
          DestroyCharts(callbacklist);
        }
        else{
          console.log("CellId is null");
        }


      });

      $("#EiCellInfoSelector").change(function(e){
        var UeInfoPara = e.target.value,
            ParaText = $(this).find("option:selected").text();

        $("#EiCellInfoChart").data("CellInfo", {CellId:CellId,Para:UeInfoPara,ParaText:ParaText});
        DrawCellInfoCharts(CurEIData[CellId],true);

        if(callbacklist.DrawCellInfo ===null){
          callbacklist.DrawCellInfo = DrawCellInfoCharts;
        }
      });

      $("#EiUeGidSelector").focus(function(e){
        var UeGidList = [],
            Gid = null;

        TableData = $("#UEInfoTable").bootstrapTable('getData');
        for(var Ueitem=0; Ueitem < TableData.length;Ueitem++){
          Gid = TableData[Ueitem].GID;
          if($(this).find("option[value="+Gid+"]").length !==0){
            continue;
          }
          UeGidList.push($("<option/>").text(Gid).val(Gid)[0].outerHTML);
        }
        $(this).append(UeGidList.join(''));
      });

      $("#EiUeGidSelector").change(function(e){
        var UeGid = e.target.value,
            $UeInfoChart =  $('#EiUeInfoChart').highcharts(),
            UeInfoSaved = $("#EiUeInfoChart").data("UEInfo");
        if(UeInfoSaved !==undefined){
          UeInfoSaved.Gid = UeGid;
          if($UeInfoChart !=null){
            $UeInfoChart.setTitle(null, { text: 'Gid:'+UeGid});
          }

        }
        else{
          UeInfoSaved  = {Gid:UeGid}
        }
        $("#EiUeInfoChart").data("UEInfo",UeInfoSaved);
        $("#EiUeInfoSelector").show(500);

      });

      $("#EiUeInfoSelector").change(function(e){
        var UeInfoPara = e.target.value,
            UeInfoSaved = $("#EiUeInfoChart").data("UEInfo"),
            ParaText = $(this).find("option:selected").text();

        $("#EiUeInfoChart").data("UEInfo", $.extend({},UeInfoSaved,{Para:UeInfoPara,ParaText:ParaText}));
        DrawUeInfoCharts(CurEIData[CellId],true);

        if(callbacklist.DrawUeInfo ===null){
          callbacklist.DrawUeInfo = DrawUeInfoCharts;
        }
      });
    }

    function InitEICellInfo(EiData){
      var Index = 0,
          DisableIndx = 0;

      for(var CellId in EiData){
        if(EiData.hasOwnProperty(CellId)){
          CellSelectorDOM[Index].val(CellId).parent().removeAttr("disabled");
          Index++;
        }
      }
      for(DisableIndx = Index;DisableIndx < 3;DisableIndx++){
        CellSelectorDOM[DisableIndx].parent().attr("disabled","disabled");
      }

    }

    function InitEIUeInfo(UeList){
      var columns = [
        {
          field:"GID",
          title:"GID",
          align:"center",
          halign:"center"

        },
        {
          field:"IP",
          title:"IP",
          align:"center",
          halign:"center"

        },
        {
          field:"PL",
          title:"PL",
          align:"center",
          halign:"center"

        },
        {
          field:"TXDiv",
          title:"TXDiv",
          align:"center",
          halign:"center"

        },
        {
          field:"DTX",
          title:"DTX",
          align:"center",
          halign:"center"

        },
        {
          field:"UlMcs",
          title:"Mcs",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlBler",
          title:"Bler",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlRbNum",
          title:"RbNum",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlHarqFail",
          title:"HarqFail",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlHarqExpire",
          title:"HarqExpire",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlHarqCnt",
          title:"HarqCnt",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlShdCnt",
          title:"ShdCnt",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlMacTput",
          title:"MacTput",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"UlPdcpTput",
          title:"PdcpTput",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-primary"}

        },
        {
          field:"DlMcs",
          title:"Mcs",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlBler",
          title:"Bler",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlRbNum",
          title:"RbNum",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlHarqFail",
          title:"HarqFail",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlHarqExpire",
          title:"HarqExpire",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlHarqCnt",
          title:"HarqCnt",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlShdCnt",
          title:"ShdCnt",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlMacTput",
          title:"MacTput",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        },
        {
          field:"DlPdcpTput",
          title:"PdcpTput",
          align:"center",
          halign:"center",
          cellStyle:{classes:"text-success"}

        }

        ],
          UeInfo = EIInfoDOM.UEInfo,
          rowItem = [],
          TableDataField = [];
      if(UeList ==null || UeList.length ===0){
        console.log("InitUeList is empty");
        return;
      }
      for(var item in UeList){
        if(UeList.hasOwnProperty(item)){
          UeItem = UeList[item];
          for(var Uepara in UeItem){
            if(UeItem.hasOwnProperty(Uepara) && UeInfo.hasOwnProperty(Uepara)){
              rowItem[UeInfo[Uepara]] = UeItem[Uepara];
            }
          }
          TableDataField.push(rowItem);
          rowItem = [];
        }
      }
      $("#UEInfoTable").bootstrapTable({
        uniqueId:"GID",
        columns:columns,
        data:TableDataField
      });
    }

    function UpdateEIData(CellEiInfo){
      if(CellEiInfo==null){
        console.log("No CellId EIInfo");
        return;
      }

      UpdateCellGeneralCfg(CellEiInfo.cellGeneralCfg);
      UpdateCellGeneralState(CellEiInfo.cellGeneralState);
      UpdateCellDetailStateUl(CellEiInfo.cellULDetailState);
      UpdateCellDetailStateDl(CellEiInfo.cellDLDetailState);
      UpdateUeInfo(CellEiInfo.ueGeneralList.ueDict);


      function UpdateCellGeneralCfg(Cfg){
        var GenericCfgDOM = EIInfoDOM.CellInfo.GenericCfg;

        if(Cfg==null||Cfg.length ===0){
          console.log("GeneralConfig does not exists");
          return;
        }
        for(var CfgItem in Cfg){
          if(Cfg.hasOwnProperty(CfgItem) && GenericCfgDOM.hasOwnProperty(CfgItem)){
            GenericCfgDOM[CfgItem].val(Cfg[CfgItem]);
          }
        }
      }

      function UpdateCellGeneralState(State){
        var GenericStateDOM = EIInfoDOM.CellInfo.GeneralState;

        if(State==null||State.length ===0){
          console.log("GeneralState does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && GenericStateDOM.hasOwnProperty(StateItem)){
            GenericStateDOM[StateItem].val(State[StateItem]);
          }
        }
      }

      function UpdateCellDetailStateUl(State){
        var DetailStateUl = EIInfoDOM.CellInfo.DetailState_Ul;

        if(State==null||State.length ===0){
          console.log("CellDetailStateUl does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && DetailStateUl.hasOwnProperty(StateItem)){
            DetailStateUl[StateItem].val(State[StateItem]);
          }
        }
      }

      function UpdateCellDetailStateDl(State){
        var DetailStateDl = EIInfoDOM.CellInfo.DetailState_Dl;

        if(State==null||State.length ===0){
          console.log("CellDetailStateDl does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && DetailStateDl.hasOwnProperty(StateItem)){
            DetailStateDl[StateItem].val(State[StateItem]);
          }
        }
      }

      function UpdateUeInfo(UeList){
        var UeItem = null,
            UeInfo = EIInfoDOM.UEInfo,
            UeListTable = $("#UEInfoTable"),
            rowItem = [],
            TableDataField = [];

        if(UeList==null||UeList.length ===0){
          console.log("UeList does not exists");
          return;
        }

        for(var item in UeList){
          if(UeList.hasOwnProperty(item)){
            UeItem = UeList[item];
            UeItem.u32IP = _int2ip(UeItem.u32IP);
            for(var Uepara in UeItem){
              if(UeItem.hasOwnProperty(Uepara) && UeInfo.hasOwnProperty(Uepara)){
                rowItem[UeInfo[Uepara]] = UeItem[Uepara];
              }
            }
            TableDataField.push(rowItem);
            rowItem = [];
          }
        }
        UeListTable.bootstrapTable('load',TableDataField);

      }
    }

    function DrawCellInfoCharts(CellInfoList,ParaChangeFlag){

      var chart = $('#EiCellInfoChart').highcharts(),
        chartSeries = null,
        CellInfo = $('#EiCellInfoChart').data("CellInfo"),
        paraVal = null;

      if(CellInfo ==null){
        console.log("No CellInfo:");
        return;
      }
      if(CellInfo.ParaText.slice(0,2) ==="UL"){
        paraVal = parseInt(CellInfoList.cellULDetailState[CellInfo.Para]);
      }
      else{
        paraVal = parseInt(CellInfoList.cellDLDetailState[CellInfo.Para]);
      }
      if(paraVal==null){
        console.log("UeParaList has no "+CellInfo.Para+" para");
        return;
      }

      if(chart ==null){
        $('#EiCellInfoChart').highcharts({
          chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
            }
          },
          credits: {
            enabled: false
          },
          title: {
            text: CellInfo.ParaText
          },
          subtitle: {
            text: 'CellID: '+CellInfo.CellId
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
            minPadding:0.01,
            showEmpty: false
          },
          yAxis: {
            title: {
              text: ''
            },
            plotOptions:{
              series:{
                animation:false
              }
            },
            showEmpty: false,
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
              name: CellInfo.Para,
              data:[paraVal],
              color:'#8085e9'
            }]
        });
      }
      else{
        chartSeries = chart.series[0];
        if(ParaChangeFlag ===true){
          chart.setTitle( {text: CellInfo.ParaText});
          chart.series[0].setData([paraVal]);
          chartSeries.update({
            name: CellInfo.Para,
            color:'#8085e9'
          });
          return;
        }
        if(chartSeries.processedXData.length >=30){
          chartSeries.addPoint(paraVal,true,true);
        }
        else{
          chartSeries.addPoint(paraVal,true,false);
        }

      }

    }

    function DrawUeInfoCharts(CellInfoList,ParaChangeFlag){
      var chart = $('#EiUeInfoChart').highcharts(),
          chartSeries = null,
          UeList = CellInfoList.ueGeneralList.ueDict,
          UeInfo = $('#EiUeInfoChart').data("UEInfo"),
          UeItem = UeList[UeInfo.Gid],
          paraVal = parseInt(UeItem[UeInfo.Para]);

      if(UeInfo ==null){
        console.log("No UEInfo:");
        return;
      }
      if(paraVal==null){
        console.log("UeParaList has no "+UeInfo.Para+" para");
        return;
      }

      if(chart ==null){
        $('#EiUeInfoChart').highcharts({
          chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
            }
          },
          credits: {
            enabled: false
          },
          title: {
            text: UeInfo.ParaText
          },
          subtitle: {
            text: 'Gid:'+UeInfo.Gid
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
            minPadding:0.01,
            showEmpty: false
          },
          yAxis: {
            title: {
              text: ''
            },
            plotOptions:{
              series:{
                animation:false
              }
            },
            showEmpty: false,
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
              name: UeInfo.Para,
              data:[paraVal],
              color:'#8085e9'
            }]
        });
      }
      else{
        chartSeries = chart.series[0];
        if(ParaChangeFlag ===true){
          chart.setTitle( {text: UeInfo.ParaText});
          chart.series[0].setData([paraVal]);
          chartSeries.update({
            name: UeInfo.Para,
            color:'#8085e9'
          });
          return;
        }
        if(chartSeries.processedXData.length >=30){
          chartSeries.addPoint(paraVal,true,true);
        }
        else{
          chartSeries.addPoint(paraVal,true,false);
        }

      }
    }

    function DrawNICharts(CellInfoList){
      var chart = $('#EiNIChart').highcharts(),
          NIValList = CellInfoList.cellULDetailState.s16NiRB,
          chartSeries = null;


      if(NIValList ==null ||NIValList.length===0){
        console.log("No UEInfo:");
        return;
      }

      if(chart ==null){
        $('#EiNIChart').highcharts({
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          events: {
          },
          title: {
            text: 'NI'
          },
          credits: {
            enabled: false
          },
          xAxis: {
            title: {
              text: 'RB'
            },
            tickInterval: 10,
            minPadding:0.01,
            showEmpty: false
          },
          yAxis: {
            title: {
              text: ''
            }
          },
          tooltip: {
            shared: true
          },
          legend: {
            enabled: false
          },
          plotOptions: {
            series: {
              pointStart: 1
            },
            area: {
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [
                  [0, Highcharts.getOptions().colors[0]],
                  [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
              },
              lineWidth: 1,
              marker: {
                enabled: false
              },
              shadow: false,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },
          series: [{
            type: 'area',
            name: 'NI',
            data:NIValList
          }]
        });
      }
      else{
        chartSeries = chart.series[0];
        chart.series[0].setData(NIValList);

      }
    }

    function DestroyCharts(callbacklist){
      var $CellChart = $("#EiCellInfoChart").highcharts(),
          $UeInfoChart = $("#EiUeInfoChart").highcharts();

      if($CellChart !=null){
        callbacklist.DrawCellInfo = null;
        $CellChart.destroy();
      }
      if($UeInfoChart !=null){
        callbacklist.DrawUeInfo = null;
        $UeInfoChart.destroy();
      }
      $("#EiCellInfoSelector").find("option:first-child").attr("selected",true);
      $("#EiUeGidSelector").find("option:first-child").attr("selected",true);
      //BugFixed:小区切换时未删除原小区UE列表
      $("#EiUeGidSelector option:gt(0)").remove();
      $("#EiUeInfoSelector").hide().find("option:first-child").attr("selected",true);
    }

    function CreateTaskHandle(TaskStatus){
      var CurTaskId = TaskStatus.task_id,
          NextLogId = 0,
          CurTimerID = null,
          TaskUITimer = null,
          TaskCurStep = null,
          $TaskProcess = $("#TaskProcess ul.timeline"),
          $TestCaseProgress = $("#TestCaseProgress"),
          TestCaseGrpName = null;

      if(CurTaskId ==null || CurTaskId.length ===0){
        return null;
      }
      TestEI(CurTaskId);
      //TestTask();
      $('#TaskSelectSection').hide(1000);
      $("#BeginTest").button('loading');
      TestCaseGrpName = GetCurTestCaseGrpName();
      $("#exec_testcasegrp").text(TestCaseGrpName);
      $("#TaskInfo").show(1000);
      $("#MonitorSection").show(1000);

      //TaskUITimer = ParseTaskRunningSection(CurTaskId);

      return function TaskLogHandler(TaskLog,Res){

        if(TaskLog.log.length !== 0){
          NextLogId = ParseTaskLogSection(TaskLog.log,NextLogId,TaskLog.current_log_id);
          $("#Log_TaskStatus").data("plugin_tinyscrollbar").update("relative");
        }
        if(TaskCurStep === null){
          TaskCurStep = TaskLog.step;
        }
        UpdateTaskProcess($TaskProcess,TaskLog.step);
        if(TaskLog.status === "run"){

          if(CurTimerID ===null){
            CurTimerID = setInterval(function () {
              Res.QueryRunningLog(TaskLogHandler,CurTaskId,NextLogId);
            }, 3000);
          }
          else if(NextLogId >TaskLog.current_log_id){
            clearInterval(CurTimerID);
            CurTimerID = setInterval(function () {
              Res.QueryRunningLog(TaskLogHandler,CurTaskId,NextLogId);
            }, 3000);
          }
        }
        else if(TaskLog.status === "close"){
          //停止轮询Log定时器
          if(CurTimerID !== null)
          {
            clearInterval(CurTimerID);
            CurTimerID = null;
          }
          if(TaskUITimer !== null)
          {
            clearInterval(TaskUITimer);
            TaskUITimer = null;
          }
          Res.TaskStatusQuery(TaskLog.task_id,TaskEndHandle);


        }



      };

      function UpdateTaskProcess($TaskProcessEle,TaskStep){
        var CurTaskStep = $TaskProcessEle.data("CurTaskStep"),
            $CurTestCaseItemEl = null;

        if(TaskStep ==null){
          console.log("No TaskStep Info");
          return;
        }

        if(CurTaskStep !==undefined){
          if(!TestCaseStepIsSame(CurTaskStep,TaskStep)){
            CreateTestCaseNode($TaskProcessEle,TaskStep);
          }
          else if(!AtomStepIsSame(CurTaskStep,TaskStep)){
            $CurTestCaseItemEl = $TaskProcessEle.data("CurTaskCaseItem");
            UpdateAtomStep($CurTestCaseItemEl,TaskStep);
          }
        }
        //根据总用例数初始化TestCase进度条
        else{
          InitTestCaseProcess($TestCaseProgress,TaskStep.TestCaseTotal);
          CreateTestCaseNode($TaskProcessEle,TaskStep);
        }

        $TaskProcessEle.data("CurTaskStep",TaskStep);

        function InitTestCaseProcess($el,TestCaseTotal){
          $el.attr({
            "data-transitiongoal":0,
            "aria-valuemin":0,
            "aria-valuemax":TestCaseTotal
          });
        }

        function TestCaseStepIsSame(OldStep,NewStep){
          if(OldStep == null){
            console.log("OldTaskStep is null");
            return;
          }

          if(NewStep == null){
            console.log("NewStep is null");
            return;
          }

          return (OldStep.TestCaseStep === NewStep.TestCaseStep &&
                  OldStep.TestCaseCurrent === NewStep.TestCaseCurrent );


        }

        function AtomStepIsSame(OldStep,NewStep){

          if(OldStep == null){
            console.log("OldTaskStep is null");
            return;
          }

          if(NewStep == null){
            console.log("NewStep is null");
            return;
          }

          return (OldStep.AtomStep === NewStep.AtomStep &&
                  OldStep.Current === NewStep.Current );



        }

        function CreateTestCaseNode($TestCaseLocation,TaskStep){
          var $el = $("<li/>").append($('<div class="time"></div>').text(TaskStep.TestCaseStep))
            .append($('<div class="number"></div>').text(TaskStep.TestCaseCurrent)),
              $TestCaseList = $TestCaseLocation.find("li:visible"),
              $AtomContent = $("<div/>").append($("<p/>").text("Atom: "+TaskStep.AtomStep))
                                        .append($("<p/>").text(TaskStep.Current+"/"+TaskStep.Total)),
              $content = $('<div class="content"></div>');

          if($TestCaseList.length >=2){
            $($TestCaseList[0]).hide(500);
          }

          $content.append($AtomContent).appendTo($el);
          $TestCaseLocation.append($el);
          UpdateTestCaseProcess(TaskStep.TestCaseCurrent);
          $TaskProcessEle.data("CurTaskCaseItem",$content);

        }

        function UpdateAtomStep($TestCaseItemEl,TaskStep){
          if($TestCaseItemEl == null){
            console.log("TestCaseItem Content is null");
            return;
          }
          if(TaskStep == null){
            console.log("Task Step is null");
            return;
          }
          $TestCaseItemEl.find("p:eq(0)").text("Atom: "+TaskStep.AtomStep);
          $TestCaseItemEl.find("p:eq(1)").text(TaskStep.Current+"/"+TaskStep.Total);
          UpdateAtomProcess($TestCaseItemEl.find(".progress .progress-bar"),TaskStep.Current);

        }

        function UpdateAtomProcess($el,CurAtomStep){
          $el.attr("data-transitiongoal",CurAtomStep).progressbar({display_text:'center',use_percentage:false});
        }

        function UpdateTestCaseProcess(CurStep){
          $TestCaseProgress.attr("data-transitiongoal",CurStep).progressbar({display_text:'fill',use_percentage:false});
        }


      }

      function TestTask(){
        var TestObj = {
          TestCaseTotal:22,
          Current:1,
          TestCaseStep:"TestCase1",
          TestCaseCurrent:1,
          AtomStep:"Atom1",
          Total:10
        };

        UpdateTaskProcess($TaskProcess,TestObj);
        setInterval(function () {
          TestObj = $.extend(true,{},TestObj);
          TestObj.Current = (TestObj.Current+1)%TestObj.Total;
          if(TestObj.Current ==0){
            TestObj.TestCaseCurrent = (TestObj.TestCaseCurrent+1)%TestObj.TestCaseTotal
          }
          UpdateTaskProcess($TaskProcess,TestObj);
        },1000);

      }

    }

    function AdjustChartsHeight(){
      var TotalHeight = $("#EISection .CellBasicInfo").height(),
          ChartList = [$("#EiCellInfoChart"),$("#EiUeInfoChart"),$("#EiNIChart")],
          SelectionHeight = 0;

      for(var item in ChartList){
        if(ChartList.hasOwnProperty(item)){
          SelectionHeight =  ChartList[item].prev(".Selection").height();
          ChartList[item].height(TotalHeight/3 - SelectionHeight);
        }
      }
    }

  });

  function _int2ip(u32ip){
    var ipstr = "",
        ipArray = [];

    ipArray[0] = (u32ip>>>24);
    ipArray[1] =((u32ip << 8)>>>24);
    ipArray[2] =((u32ip << 16)>>>24);
    ipArray[3] = ((u32ip << 24)>>>24);

    return ipArray.join('.');
  }

  function ParseTestCaseGrpSection(ResList){
    var TestCaseGrp = null;
    var template = $(' <div class="form-group">\
      <div class="col-sm-1">\
      <input type="radio" name="TestCaseGrp">\
      </div>\
      <label></label>\
      </div>');
    var ResTypeStr = (ResType === "Sim") ? "simulation":"real";
    var TestCaseGrpList = [];

    for(var item in ResList){
      if(ResList.hasOwnProperty(item) ){
        if(ResList[item].Type !=="both" && ResList[item].Type !==ResTypeStr){
          continue;
        }
        TestCaseGrp = ResList[item];
        template.find("label").attr('for','TestCaseGrp_'+TestCaseGrp.ID).text(TestCaseGrp.Name);
        template.find("input").attr({
          'value':TestCaseGrp.ID,
          'ID':'TestCaseGrp_'+TestCaseGrp.ID
        });

        TestCaseGrpList.push(template[0].outerHTML);

      }
    }
    $('#TestCaseGrpSection_body').append(TestCaseGrpList.join(''));
  }

  function TestCaseGrpLoaded(Type,ResList){
    if(ResList ==null){
      console.log("ResList Error");
      return;
    }

    $(function(){
      ParseTestCaseGrpSection(ResList);
    });

  }

  function ParseTaskRunningSection(TaskId){

    var template = $(' <div class="panel panel-default" style="display: none">\
      <div class="panel-heading panel-default">\
        <h4 class="panel-title">\
          <a data-toggle="collapse" data-parent="#panel_TaskList"></a>\
          <span class="badge badge-inverse pull-right">Running</span>\
        </h4>\
      </div>\
      <div class="panel-collapse collapse">\
        <div class="panel-body">\
        实时显示当前原子操作--敬请期待\
        </div>\
      </div>\
      </div>'),
        SpanFlashTimerID = null,
        SpanInstCache = template.find(".panel-title span");


    template.attr("id",TaskId);
    template.find("a[data-toggle=collapse]").text(common.DateFormat(null)).attr("href","#panel_TaskItem"+"_"+TaskId);
    template.find(".panel-body").parent().attr("id","panel_TaskItem"+"_"+TaskId);

    SpanFlashTimerID = setInterval(function(){ SpanInstCache.fadeOut(500).fadeIn(500); },1000);
    $("#panel_TaskList").append(template);
    template.show(500);

    return SpanFlashTimerID;
  }

  function TaskEndHandle(TaskStatusRes){
    var TaskStatus = TaskStatusRes.task;
    $('#BeginTest').button('reset');
    if(TaskStatusRes.result === 0 && TaskStatusRes.message === 'success'){
      $("#UpLoadBtn").remove();
      $('#UploadFile_progress .progress-bar').css(
        'width', 0
      ).text('');
      $('#UploadFile_progress').hide();

    }
    else{
      console.log('TaskStatus Query Result not successed,Taskid:' + TaskStatusRes.task_id);
      $("#exec_status").removeClass("badge-success").addClass("badge-inverse").text("任务状态异常");
    }
    if(TaskStatus === undefined){
      return;
    }

    if(TaskStatus.result === "fail"){
      $("#" + TaskStatus.id + " span.badge").text("失败");
      $("#" + TaskStatus.id).removeClass("panel-default").toggleClass("panel-danger",true);
      $("#" + TaskStatus.id + " span.badge").removeClass("badge-inverse").toggleClass("badge-important",true);
      $("#exec_status").removeClass("badge-success").addClass("badge-important").text("失败").fadeOut(500).fadeIn(500);
    }
    else if(TaskStatus.result === "success"){
      $("#" + TaskStatus.id + " span.badge").text("成功");
      $("#" + TaskStatus.id).removeClass("panel-default").toggleClass("panel-success",true);
      $("#" + TaskStatus.id + " span.badge").removeClass("badge-inverse").toggleClass("badge-success",true);
      $("#exec_status").text("成功").fadeOut(500).fadeIn(500);
    }
    else{
      console.log('Unknown TaskStatus Result: '+ TaskStatus.result);
    }
  }

  function ParseTaskLogSection(TaskLog,Begin,End){
    var item = 0;
    var length = 0;

    if(Begin > End){
      End = TaskLog.length;
      item = Begin;
    }
    length = End - Begin;

    for(;item < length;item++){
      if(TaskLog.hasOwnProperty(item)){
        $('#Log_TaskStatusContent').append($("<p/>").html(TaskLog[item].content));
      }
    }

    if(item === length){
      return Begin+length;
    }
    else{
      //错误处理
    }
  }

  function ModifySubmitObject(ResType,IsURL){

    if(IsURL){
      return { url:null };
    }

    if(ResType === "Real"){
      return { bin:null  };

    }
    else if(ResType === "Sim"){
       return {
        lte_app:null,
        lte_db:null
      };

    }
  }



});