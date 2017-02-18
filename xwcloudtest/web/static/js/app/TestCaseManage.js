/**
 * Created by Administrator on 2015/9/19.
 */

define(function(require){
  var $ = require('jquery'),
      Usr = require("obj/UserObj"),
      validator = null,
      TaskGrpAddPage = $(' \
       <div class="col-md-12">\
        <div class="btn-toolbar pull-right" role="toolbar">                                          \
          <div class="btn-group">                                                          \
            <button type="button" class="btn btn-default" id="Back">返回</button>  \
            <button type="button" class="btn btn-primary" id="Submit">提交</button>  \
          </div>\
        </div> \
       </div>  \
        <div class="col-md-3 TestCasesPanel">\
          <ul id="TestCaseManageTab" class="nav nav-tabs">\
            <li class="">\
              <a href="#AtomContent" data-toggle="tab">原子操作</a>\
            </li>\
            <li><a href="#ComponentContent" data-toggle="tab">组件</a></li>\
            <li><a href="#TestCaseContent" data-toggle="tab">测试用例</a></li>\
          </ul>\
          <div id="TestCaseManageContent" class="tab-content">\
            <div class="tab-pane fade in active well" id="AtomContent"></div> \
            <div class="tab-pane fade well" id="ComponentContent"></div>\
            <div class="tab-pane fade well" id="TestCaseContent"></div>\
          </div>         																															\
        </div>  \
        <div class="col-md-8 col-md-offset-1 TestCasesPanel">                         \
          <div class="row">                                                                 \
              <div class="col-md-12">                                                                    \
                <div class="panel panel-primary" id="SubmitSection">                                                       \
                  <div class="panel-heading">                                                           \
                    <h3 class="panel-title">测试用例组</h3>                                             \
                  </div>                                                                                \
                  <div class="panel-body" id="drag-dropZone">                                           \
                    <h4 class="center-block">\
                    <small>请拖拽或双击左侧操作</small>\
                    </h4>                          \
                  </div>                                                                                 \
                </div>                                                                                   \
          </div> \
              </div> \                                                                                                                           </div> \
        <div class="modal fade" id="modal-container" role="dialog" aria-labelledby="TestCaseModalLabel" aria-hidden="true">\
          <div class="modal-dialog">                                                        \
            <div class="modal-content">                                                     \
              <div class="modal-header">																										\
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">\
                  ×                                                                        \
                </button>                                                                   \
                <h4 class="modal-title" id="TestCaseModalLabel">                            \
                  用例参数配置                                                              \
                </h4>                                                                       \
              </div>                                                                        \
              <div class="modal-body">                                                      \
                <form class="form-horizontal" role="form">                                  \
                </form>                                                                     \
              </div>                                                                        \
              <div class="modal-footer">                                                    \
                                                                                                      \
                <button type="button" class="btn btn-default" data-dismiss="modal">         \
                  关闭                                                                      \
                </button>                                                                   \
                <button type="button" class="btn btn-primary" id="SavCfg">                              \
                  保存配置                                                                  \
                  </button>																																		 \
              </div>                                                                         \
            </div>                                                                           \
                                                                                                       \
          </div>                                                                             \
                                                                                                       \
        </div>                                                                               \
        <div class="modal fade" id="modal-submit" role="dialog" aria-labelledby="TestCaseModalLabel" aria-hidden="true">\
          <div class="modal-dialog">                                                        \
            <div class="modal-content">                                                     \
              <div class="modal-header">																										\
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">\
                  ×                                                                        \
                </button>                                                                   \
                <h4 class="modal-title" id="TestCaseModalLabel">                            \
                  用例参数配置                                                              \
                </h4>                                                                       \
              </div>                                                                        \
              <div class="modal-body">                                                      \
                <form class="form-horizontal" role="form">                                  \
                </form>                                                                     \
              </div>                                                                        \
              <div class="modal-footer">                                                    \
                                                                                                      \
                <button type="button" class="btn btn-default" data-dismiss="modal">         \
                  关闭                                                                      \
                </button>                                                                   \
                <button type="button" class="btn btn-primary" id="SubmitResult">                              \
                  提交                                                                  \
                  </button>																																		 \
              </div>                                                                         \
            </div>                                                                           \
          </div>                                                                            \
        </div>\               ');

  require("jquery_ui");
  require("jquery_validate");
  require("bootstrap");
  require("bootstrap-table");
  require("bootstrap_notify");

  $(function(){

    $("#TestCaseManageTabHomepage").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href");
      var Type = "";
      switch (href){
        case "#AtomContent":
          Type = "Atom";
          break;
        case "#ComponentContent":
          Type = "Component";
          break;
        case "#TestCaseContent":
          Type = "TestCase";
          break;
        case "#TestCaseGrpContent":
          Type = "TestCaseGrp";
          break;
        default :
          break;
      }
      if(Type === "Atom"){
        $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
          $("#Create").attr("disabled","disabled");
          Usr.Query(MainPageResLoaded,Type);
        });
        $(this).children("a[data-toggle=tab]").on('hide.bs.tab', function (e) {
          $("#Create").removeAttr("disabled");
        });
      }
      else{
        $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
          Usr.Query(MainPageResLoaded,Type);
        });
      }

    });

    $("#TestCaseManageTabHomepage > li:eq(0) > a").tab("show");

    //页面控件事件注册
    $('#Create').click(function(event) {
      var ModuleActive = $("#TestCaseManageTabHomepage > li.active a").attr("href");
      var ModuleId = "";
      switch (ModuleActive){
        case "#ComponentContent":
          ModuleId = "ComponentCreate";
          break;
        case "#TestCaseContent":
          ModuleId = "TestCaseCreate";
          break;
        case "#TestCaseGrpContent":
          ModuleId = "TestCaseGrpCreate";
          break;
        default :
          break;
      }
      //TODO:重构

      RegisterClickEvent(ModuleId);
    });
  });

  function IsSubmitSectionEmpty(){
    var content = $("#drag-dropZone").children("p.ui-draggable");
    if(content.length ===0){
      return true;
    }
    else{
      return false;
    }
  }

  function GenerateTestCaseInGrpHtmlEle(itemData){

    var template = null;

    template = $('<p class="ui-draggable"><a class="btn btn-default center-block" \
                   role="button" id="modal"><span>' + itemData.Name +
      '<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash">\
      </span></button></span></a></p>');

    return template;
  }

  function GenerateDropdownContent(AtomOperationList){
    var ItemContainer = $('<ul class="dropdown-menu" role="menu"></ul>'),
      ItemLoop = null,
      Atom = null,
      ItemTemplate = $('<li><a href="#"></a></li>');

    for(ItemLoop in AtomOperationList){
      if(AtomOperationList.hasOwnProperty(ItemLoop)){
        Atom = AtomOperationList[ItemLoop];
        ItemTemplate.find("a").text(Atom.Name);
        ItemContainer.append(ItemTemplate.clone());
      }
    }

    return ItemContainer;
  }

  function CfgElePara(el,OperationType,OperationObj,EleId){

    var ItemContainer  =null;
    //增加测试用例点击事件
    if(OperationType === "Atom"){
      el.find('a').attr({
        'data-toggle':"modal",
        'data-target':"#modal-container"
      }).addClass("btn-danger");

      el.find("a.btn").click(function(e){

        ParseAtomParaToModalPage(OperationObj);
        if(validator !==null){
          validator.settings.submitHandler = FormSubmitHandler;
          validator.settings.rules = OperationObj.validate.rules;
          validator.settings.messages = OperationObj.validate.messages;
        }
        else{
          validator = $("#modal-container .modal-body form").validate({
            debug: true,
            rules:OperationObj.validate.rules,
            messages: OperationObj.validate.messages,
            submitHandler:FormSubmitHandler,
            errorClass:"UserVerifyError"
          });

          function FormSubmitHandler(form){
            $(form).find("input").each(function(index){
              OperationObj.CfgPara[index].Val = $(this).val();
            });

            $('#modal-container').modal('hide');
            $(e.currentTarget).toggleClass("btn-danger",false);


          }
        }


        //保存配置，TODO:加入Jquery-validation校验表单
        $("#SavCfg").unbind("click").bind("click", function(event){
          event.stopPropagation();
          $("#modal-container .modal-body form").submit();
        });

      });
    }
    //组件or测试用例展示包含的原子操作
    else if(OperationType === "Component" || OperationType === "TestCase"){
      el.find("span:first").prepend('<span class="glyphicon glyphicon-plus pull-left"></span>');
      el.find('a').attr("data-toggle","dropdown").addClass("dropdown-toggle").wrap("<li></li>").parent().addClass("dropdown");
      ItemContainer = GenerateDropdownContent(OperationObj.AtomOperationList);
      el.children("li.dropdown").append(ItemContainer);
    }
    el.find('a').attr("id",EleId);



  }

  function HandleModifyAtomList(Type,OperationList,OperationTableList){
    var OperationItem = null,
        OperationItemToPush = null,
        templateInGrp = null,
        EleId = null;

    for(var item in OperationList){
      if(OperationList.hasOwnProperty(item)){
        OperationItem = OperationList[item];
        OperationItemToPush = $.extend(true,{},OperationItem);
        templateInGrp = GenerateTestCaseInGrpHtmlEle(OperationItem);

        //操作存入要提交的操作序列中
        EleId = (OperationTableList.push({
          Type:Type,
          Operation:OperationItemToPush
        }) - 1);

        CfgElePara(templateInGrp,Type,OperationItemToPush,EleId);
        templateInGrp.find('a').removeClass("btn-danger");
        //增加测试用例点击事件

      }

      $("#drag-dropZone").append(templateInGrp);
      templateInGrp.find('button').unbind("click").bind("click", function(event) {
        //阻止事件传播，停止冒泡
        var id = $(this).parents("a.btn").attr("id");
        event.stopPropagation();
        $(this).parents("p.ui-draggable").remove();
        OperationTableList[id] = undefined;

      });
    }
  }

  function AddParaToList(TargetOperation,OriOperation){
    for(var item in OriOperation.CfgPara){
      if(OriOperation.CfgPara.hasOwnProperty(item)){
        TargetOperation.argv.push({
          name:OriOperation.CfgPara[item].Name,
          value:OriOperation.CfgPara[item].Val
        });
      }
    }
  }

  function ParseAtomParaToModalPage(OperationObj){
    var ParaItemTemplate = $('<div class="form-group">                                                  \
                                <label for="" class="col-sm-3 control-label"></label>         \
                                <div class="col-sm-5">                                                  \
                                  <input type="text" class="form-control" id=""                    \
                                     placeholder="">                                          \
                                </div>                                                                  \
                               </div>                                \ ');
    var ParaItem = null;
    $("#modal-container h4.modal-title").text(OperationObj.Name);
    $("#modal-container form").html("");

    //添加原子操作参数到配置页面
    for(var item in OperationObj.CfgPara){
      if(OperationObj.CfgPara.hasOwnProperty(item)){
        ParaItem = ParaItemTemplate.clone();
        ParaItem.find("label").text(OperationObj.CfgPara[item].Name).attr("for",OperationObj.CfgPara[item].Name);
        ParaItem.find("input").attr({
          "placeholder":OperationObj.CfgPara[item].Type,
          "name":OperationObj.CfgPara[item].Name,
          "id":OperationObj.CfgPara[item].Name
        });
        if(OperationObj.CfgPara[item].Val !== null || OperationObj.CfgPara[item].Val != ""){
          ParaItem.find("input").attr("value",OperationObj.CfgPara[item].Val);
        }
        $("#modal-container form").append(ParaItem);
      }
    }
  }

  function ParseCfgToModalPage(type,Item){
    //TODO:重构，去掉TestGrp
    var ParaItemTemplate = $('<div class="form-group">                                                  \
                                <label for="para1" class="col-sm-3 control-label"></label>         \
                                <div class="col-sm-5">                                                  \
                                  <input type="text" class="form-control" id="para"                    \
                                     placeholder="">                                          \
                                </div>                                                                  \
                               </div>  \ ');
    var ParaName = ParaItemTemplate.clone();
    var ParaDesc = ParaItemTemplate.clone();
    var name = "";

    switch (type){
      case "ComponentCreate":
      case "Component":
        name = "组件";
        break;
      case "TestCaseCreate":
      case "TestCase":
        name = "用例";
        break;
      case "TestCaseGrpCreate":
      case "TestCaseGrp":
        name = "用例组";
        break;
      default :
        console.log("UnKnown Type to Modify Modal Window");
        break;
    }

    $("#modal-submit h4.modal-title").text(name + "提交");
    $("#modal-submit form").html("");

    ParaName.find("label").text(name + "名称");
    ParaName.find("input").attr({
      "placeholder":"请填写"+name+"名",
      "id":"name",
      "name":"name"
    });
    ParaDesc.find("label").text(name + "描述");
    ParaDesc.find("input").attr({
      "placeholder":"请填写"+name+"描述",
      "name":"desc",
      "id":"desc"
    });

    if(Item !==null ){
      $("#SavCfg").text("修改");
      $("#modal-submit h4.modal-title").text(name+ " " + Item.Name + "修改");
      ParaName.find("input").attr("value",Item.Name);
      ParaDesc.find("input").attr("value",Item.Desc);
    }

    $("#modal-submit form").append(ParaName);
    $("#modal-submit form").append(ParaDesc);

  }

  function GenerateSubmitOperationList(Type,SubmitObj){
    var OperationList = [];
    var ItemId = null;
    var Operation = null;
    var OperationToAdd = null;
    var OpeItem = null;
    var IsSimulationOperation = false;
    var IsRealOperation = false;

    if($("#drag-dropZone").find("a").length === 0){
      $.notify({
        icon: 'fa fa-exclamation-circle',
        message: "请填写提交部分"
      },
        {type:'danger'});
      $("#drag-dropZone").fadeOut(500).fadeIn(500);
      return;
    }

    //根据提交区块的操作，生成提交结构
    $("#drag-dropZone").find("a.btn").each(function(index){
      var TestCase = null,
          OperationType = "",
          ItemId = $(this).attr("id");

      if(ItemId === null){
        console.log("Opeation has no id,name: "+ $(this).find("span").text());
        return;
      }
      //测试用例组的处理
      if(SubmitObj.sequenceOfOpera[ItemId].Type === "TestCase"){

        TestCase = SubmitObj.sequenceOfOpera[ItemId].Operation;

        OperationList.push({
          id:TestCase.ServerId,
          name:TestCase.Name
        });
        return;
      }
      OperationType = SubmitObj.sequenceOfOpera[ItemId].Type;
      Operation = SubmitObj.sequenceOfOpera[ItemId].Operation;
      //写入测试用例的适用的执行环境
      if(Operation.Env === "real"){
        IsRealOperation = true;
      }
      else if(Operation.Env === "simulation"){
        IsSimulationOperation = true;
      }
      OperationToAdd = {
        id:Operation.ServerId,
        name:Operation.Name,
        type:"keyword",
        argv:[]
      };
      //根据提交区块的操作（原子，组件）类型，生成不同结构
      switch (OperationType){
        case "Atom":
          AddParaToList(OperationToAdd,Operation);
          OperationList.push($.extend(true,{},OperationToAdd));
          break;
        case "Component":
          //TODO:组件Type填写后续再做
          //OperationToAdd.type = "component";
          //遍历组件中的原子操作
          for(var AtomItem in Operation.AtomOperationList){
            if(Operation.AtomOperationList.hasOwnProperty(AtomItem)){
              OpeItem = Operation.AtomOperationList[AtomItem];
            }
            else{
              console.log("Operation.AtomOperationList has no propertypeof AtomItem");
              continue;
            }
            OperationToAdd.id = OpeItem.SeverId;
            OperationToAdd.name = OpeItem.Name;
            //生成与原子操作相同的操作
            AddParaToList(OperationToAdd,OpeItem);
            OperationList.push($.extend(true,{},OperationToAdd));
          }
          break;
      }

    });
    if(IsSimulationOperation && IsRealOperation){
      $.notify({
          icon: 'fa fa-exclamation-circle',
          message: "不能选择sim+real原子操作组合"
        },
        {type:'danger'});
      return;
    }
    else if(IsSimulationOperation){
      SubmitObj.type = "simulation";
    }
    else if(IsRealOperation){
      SubmitObj.type = "real";
    }
    else if(!IsSimulationOperation && !IsRealOperation){
      SubmitObj.type = "both";
    }
    //替换原有结构的操作列表，TODO:是否需要回滚？
    if(Type === "TestCaseGrpCreate" || Type === "TestCaseGrp"){
      delete SubmitObj.sequenceOfOpera;
      SubmitObj.testcase = OperationList;
    }
    else{
      SubmitObj.sequenceOfOpera = OperationList;
    }

  }

  function RegisterClickEvent(id){

    var href = null;
    var SubmitValidator = null;
    var SubmitObj = {
      name:"",
      desc:"",
      type:"",
      user:Usr.GetUsrName(),
      sequenceOfOpera:[]
    };
    var OperationId = id.slice(id.indexOf('_')+1);
    var OperationTableList = SubmitObj.sequenceOfOpera;
    var OperationObj = {};
    var OpeType = id.slice(0,id.indexOf("_"));
    var IsModify = !isNaN(parseInt(OperationId));
    $('#content').html(TaskGrpAddPage).hide().fadeIn(500);


    //根据新建操作类型，修改页面
    if(id === "ComponentCreate" || OpeType === "Component"){
      $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
      $('#TestCaseContent').remove();
      $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
      $('#ComponentContent').remove();
      $('#SubmitSection .panel-title').text("组件");
    }
    else if(id === "TestCaseCreate" || OpeType === "TestCase"){
      $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
      $('#TestCaseContent').remove();
      $('#SubmitSection .panel-title').text("测试用例");
    }
    else if(id === "TestCaseGrpCreate" || OpeType === "TestCaseGrp"){
      $('#TestCaseManageTab').find("a[href=#AtomContent]").parent().remove();
      $('#AtomContent').remove();
      $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
      $('#ComponentContent').remove();
      $('#SubmitSection .panel-title').text("测试用例组");
    }


    //注册标签页激活时，请求相应资源事件
    $("#TestCaseManageTab").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href");
      var ResList = null;
      var Type = "";

      switch (href){
        case "#AtomContent":
          ResList = Usr.GetAtomOperationList();
          Type = "Atom";
          break;
        case "#ComponentContent":
          ResList = Usr.GetComponentList();
          Type = "Component";
          break;
        case "#TestCaseContent":
          ResList = Usr.GetTestCaseList();
          Type = "TestCase";
          break;
        default :
          break;
      }
      $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
        if(ResList ==null || ResList.length ===0){
          Usr.Query(ParseResItem,Type);
        }
        else{
          ParseResItem(Type,ResList);
        }
      });
    });


    $("#TestCaseManageTab > li:eq(0) > a").tab("show");

    $('#drag-dropZone').droppable({
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      accept: ":not(.ui-sortable-helper)",
      drop: function (e, ui) {
        GenerateDropZoneEle(ui.draggable);




      }
    }).sortable({
      revert: true,
      receive: function () {
      },
      sort: function() {
        $( this ).removeClass( "active" );
      }
    });

    $('#Back').click(function(){
      window.open("TestCaseManage.html","_self");
    });

    //用例组修改

    if(IsModify){
      var OpeSelected = null;
      var ParseLocation = '#drag-dropZone';
      var ResList = null;
      var OriTestCase = null;

      $(ParseLocation).find('h4').remove();

      switch (OpeType){
        case "Atom":
          console.log("Atom Can not be Modify");
          break;

        case "Component":
          ResList = Usr.GetComponentList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("Atom",OpeSelected.AtomOperationList,OperationTableList);
          break;

        case "TestCase":
          ResList = Usr.GetTestCaseList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("Atom",OpeSelected.AtomOperationList,OperationTableList);
          break;

        case "TestCaseGrp":
          ResList = Usr.GetTestCaseGrpList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("TestCase",OpeSelected.TestCaseList,OperationTableList);
          break;

        default:
          break;
      }
    }

    //定义提交操作
    $('#Submit').click(function(){

      var SubmitRules = {
        name: {
          required: true
        },
        desc:{
          required: true
        }
      },
          SubmitMessages = {
        name: {
          required: '请输入名字'
        },
        desc: {
          required: '请输入描述'
        }
      };

      if(true === IsSubmitSectionEmpty()){
        $.notify({
            icon: 'fa fa-exclamation-circle',
            message: "请拖拽操作至提交区域"
          },{type:'danger'});
        return;
      }
      //为填写必填参数
      if(true === $("#drag-dropZone").find("a").hasClass("btn-danger")){
        $.notify({
          icon: 'fa fa-exclamation-circle',
          message: "请填写原子操作参数"
        },{type:'danger'});
        return;
      }
      if(IsModify){
        ParseCfgToModalPage(OpeType,OpeSelected);
        if(SubmitValidator !==null){
          SubmitValidator.settings.submitHandler = SubmitHandler_Modify;
          SubmitValidator.settings.rules = SubmitRules;
          SubmitValidator.settings.messages = SubmitMessages;
        }
        else{
          SubmitValidator = $("#modal-submit .modal-body form").validate({
            debug: true,
            rules: SubmitRules,
            messages: SubmitMessages,
            submitHandler:SubmitHandler_Modify,
            errorClass:"UserVerifyError"
          });
        }



      }
      else{
        ParseCfgToModalPage(id,null);
        if(SubmitValidator !==null){
          SubmitValidator.settings.submitHandler = SubmitHandler_Create;
          SubmitValidator.settings.rules = SubmitRules;
          SubmitValidator.settings.messages = SubmitMessages;
        }
        else{
          SubmitValidator = $("#modal-submit .modal-body form").validate({
            debug: true,
            rules: SubmitRules,
            messages: SubmitMessages,
            submitHandler:SubmitHandler_Create,
            errorClass:"UserVerifyError"
          });
        }


      }

      $('#modal-submit').modal('show');

      //保存配置，TODO:加入Jquery-validation校验表单
      $("#SubmitResult").unbind("click").bind("click", function(event){
        event.stopPropagation();
        $("#modal-submit .modal-body form").submit();

      });

      function SubmitHandler_Modify(form){
        $(form).find("input").each(function(index){
          SubmitObj[$(this).attr("id")] = $(this).val();
        });

        //生成请求的原子操作列表（操作+参数）
        GenerateSubmitOperationList(OpeType,SubmitObj);
        SubmitObj.id = OpeSelected.ServerId;
        Usr.Modify(function(Result){
          if(Result.result !=0 || Result.message != 'success'){
            $.notify({
              icon: 'fa fa-exclamation-circle',
              message: Result.message
            },{type:'danger'});
            return;
          }
          $.notify({
            icon: 'fa fa-check',
            message: "Modify Successfully!"
          },{type:'success'});
          delete SubmitObj.testcase;
          delete SubmitObj.id;
          SubmitObj.sequenceOfOpera = [];
          OperationTableList = SubmitObj.sequenceOfOpera;
          $("#Back").trigger("click");

        },OpeType,SubmitObj);
        $('#modal-submit').modal('hide');
      }

      function SubmitHandler_Create(form){

        $(form).find("input").each(function(index){
          SubmitObj[$(this).attr("id")] = $(this).val();
        });
        GenerateSubmitOperationList(id,SubmitObj);
        Usr.Create(function(Res){
          if(Res.result !=0 || Res.message != 'success'){
            return;
          }
          $.notify({
            icon: 'fa fa-check',
            message: "Submit "+id.slice(0,-6)+"Success!"
          },{type:'success'});
          if(id === "TestCaseGrp"){
            delete SubmitObj.testcase;
          }
          SubmitObj.sequenceOfOpera = [];
          OperationTableList = SubmitObj.sequenceOfOpera;
          $("#drag-dropZone").html('<h4 class="center-block"><small>请拖拽或双击左侧操作</small></h4> ');

        },id,SubmitObj);

        $('#modal-submit').modal('hide');

      }
    });


    function ParseResItem(Type,ResList){
      var TestCaseGrp= null;
      var ParseLoc = "";
      if(ResList ==null){
        //错误处理
        setTimeout(function(){
          Usr.Query(ParseResItem,Type);
        },1000);
        $(ParseLoc).html("<h4>Query Failed Reason: "+Result.message+"</h4>");
        return;
      }
      else if(ResList === -1){
        setTimeout(function(){
          Usr.Query(ParseResItem,Type);
        },1000);
        $(ParseLoc).html("<h4>Query Failed Reason: Ajax Return Error!</h4>");
        return;
      }
      if(ResList.length ===0){
        console.log(Type+"List len=0");
        return;
      }
      switch (Type){
        case "Atom":
          ParseLoc = "#AtomContent";
          GenerateAtomCategory(ParseLoc,ResList);
          break;
        case "Component":
          ParseLoc = "#ComponentContent";
          GenerateGeneralList(Type,ParseLoc,ResList);
          break;
        case "TestCase":
          ParseLoc = "#TestCaseContent";
          GenerateGeneralList(Type,ParseLoc,ResList);
          break;
        case "TestCaseGrp":
          ParseLoc = "#TestCaseGrpContent";
          GenerateGeneralList(Type,ParseLoc,ResList);
          break;
      }
      //注册拖拽事件
      $(ParseLoc+" p").draggable({
        helper: 'clone',
        //connectToSortable: "#drag-dropZone",
        opacity: 0.6,
        revert:'invalid'
      }).disableSelection();
      //执行成功，去掉标签切换事件
      $("a[href="+ParseLoc+"]").off("show.bs.tab");
      function GenerateAtomCategory(Location,ResList){
        var PanelGrp = {};
        var ItemTemplate = $('<p><a class="btn btn-default center-block panel-AtomItem" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
        var PanelTemplate = $(' <div class="panel panel-info">\
                        <div class="panel-heading">\
                          <h4 class="panel-title">\
                            <a data-toggle="collapse">\
                              <span class="glyphicon glyphicon-plus DetailIcon"></span>\
                              <span class="AtomType"></span>\
                            </a>\
                          </h4>\
                        </div>\
                        <div class="panel-collapse collapse">\
                          <div class="panel-body">\
                          </div>\
                        </div>\
                        </div>');
        var PanelContainer = $('<div class="panel-group" id="panel_AtomList"></div>');
        var PanelInstance = null;
        $(Location).html("");
        $.each(ResList,function(index,ResItem){
          if(ResItem == null){
            return;
          }
          var Instance = ItemTemplate.clone();
          var ResType = ResItem.Type;
          Instance.find('a')
            .attr('data-content',ResItem.Descp).popover({
              'trigger':'click hover'
            })
            .dblclick(function(){
              GenerateDropZoneEle($(this).parent());
            });
          Instance.find('span').text(ResItem.Name);
          Instance.data("Info",{Type:"Atom",Index:index});
          if(PanelGrp[ResType] ==null){
            PanelInstance = PanelTemplate.clone();
            PanelInstance.find("a[data-toggle=collapse]").attr("href","#AtomType_"+ResType);
            PanelInstance.find(".panel-body").append(Instance).parent().attr("id","AtomType_"+ResType);
            PanelInstance.find(".panel-heading span.AtomType").text(ResType);
            PanelGrp[ResType] = {
              Panel:PanelInstance,
              PanelBody:PanelInstance.find(".panel-body")
            };
          }
          else{
            PanelGrp[ResType].PanelBody.append(Instance);
          }
        });
        for(var PanelItem in PanelGrp){
          if(PanelGrp.hasOwnProperty(PanelItem)){
            PanelGrp[PanelItem].Panel.appendTo(PanelContainer);
          }
        }
        $(Location).append(PanelContainer);
        PanelContainer.children(":first").find(".panel-collapse").collapse('show');
      }
      function GenerateGeneralList(Type,Location,ResList){
        var ItemTemplate = $('<p><a class="btn btn-default center-block" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
        $(Location).html("");
        $.each(ResList,function(index,ResItem){
          if(ResItem == null){
            return;
          }
          var Instance = ItemTemplate.clone();
          Instance.find('a')
            .attr('data-content',ResItem.Descp).popover({
              'trigger':'click hover'
            }).dblclick(function(){
              GenerateDropZoneEle($(this).parent());
            });
          Instance.find('span').text(ResItem.Name);
          Instance.data("Info",{Type:Type,Index:index});
          $(Location).append(Instance);
        });
      }
    }
    function GenerateDropZoneEle(Ele) {
      var EleId = null;
      var EleContent = Ele.data("Info");
      var OperationType = EleContent.Type;
      var OperationIndex = EleContent.Index;
      var el = Ele.clone();
      var RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash"></span></button>');
      var List = null;
      var $dropZone =$('#drag-dropZone');
      $dropZone.find('h4').remove();
      switch (OperationType){
        case "Atom":
          List = Usr.GetAtomOperationList();
          break;
        case "Component":
          List = Usr.GetComponentList();
          break;
        case "TestCase":
          List = Usr.GetTestCaseList();
          break;
      }
      el.find('a').removeAttr("data-container data-placement data-content data-original-title title");
      el.find("span").first().append(RemoveBtn);
      //复制原始操作
      if(List.hasOwnProperty(OperationIndex)){
        OperationObj = $.extend(true,{},List[OperationIndex]);
        //操作存入要提交的操作序列中
        EleId = (OperationTableList.push({
          Type:OperationType,
          Operation:OperationObj
        }) - 1);
        CfgElePara(el,OperationType,OperationObj,EleId);
      }
      $(RemoveBtn).unbind("click").bind("click", function(event) {
        //阻止事件传播，停止冒泡
        var id = $(this).parents("a.btn").attr("id");
        event.stopPropagation();
        $(this).parents("p.ui-draggable").remove();
        OperationObj = {};
        //TODO:优化，如果删除操作过多，会使数组长度一直变大,使用slice()缩小数组长度，但需要更新页面的id
        OperationTableList[id] = undefined;
      });
      $dropZone.append(el);
    }
  }

  function MainPageResLoaded(Type,OperationList){

    var ParseLoc = null;
    var EventLoc = "";
    var OperationItem = null;
    var TableLoadData = [];
    switch (Type){
      case "Atom":
        ParseLoc = $("#AtomTable");
        EventLoc = "#AtomContent";
        break;
      case "Component":
        ParseLoc = $("#ComponentTable");
        EventLoc = "#ComponentContent";
        break;
      case "TestCase":
        ParseLoc = $("#TestCaseTable");
        EventLoc = "#TestCaseContent";
        break;
      case "TestCaseGrp":
        ParseLoc = $("#TestCaseGrpTable");
        EventLoc = "#TestCaseGrpContent";
        break;
    }

    if(OperationList.length ==0 ){
      //错误处理
      setTimeout(function(){
        Usr.Query(MainPageResLoaded,Type);
      },60*1000);

      return;
    }
    else if(OperationList === null){
      setTimeout(function(){
        Usr.Query(MainPageResLoaded,Type);
      },1000);
      ParseLoc.html("<h4>Query Failed Reason: Ajax Return Error!</h4>");
      return;
    }

    for(var item in OperationList){
      if(OperationList.hasOwnProperty(item)){
        OperationItem = OperationList[item];
        TableLoadData.push({
          ID:OperationItem.ID,
          RemoteID:OperationItem.ServerId,
          Name:OperationItem.Name,
          Creator:OperationItem.Creator,
          Type:OperationItem.Type
        });
      }
    }
    AddExpandRowHandler(Type,ParseLoc,OperationList);
    ParseLoc.bootstrapTable('load',TableLoadData);
    ParseLoc.bootstrapTable('hideLoading',true);

    if(Type === "Atom"){
      $("a[href="+EventLoc+"]").off('show.bs.tab').on('show.bs.tab', function (e) {
        $("#Create").attr("disabled","disabled");
      });
    }
    else{
      $("a[href="+EventLoc+"]").off("show.bs.tab");
    }
  }

  function AddExpandRowHandler(OperationType,$el,OperationList){
    if(OperationType === "Component" || OperationType === "TestCase"){
      $el.on("expand-row.bs.table",function(e,index, row, $detail){
        var html = $('<div/>'),
            AtomList = OperationList[row.ID].AtomOperationList;
        if(OperationList[row.ID] === undefined){
          console.log("No Such ID Resource");
          return;
        }

        $.each(AtomList,function(Index,Atom){
          var htmlCol = $("<div class='col-md-3'></div>");
          GenerateLevelEle(1,(Index+1)+"."+Atom.Name);
          htmlCol.append(GenerateLevelEle(1,(Index+1)+"."+Atom.Name));

          $.each(Atom.CfgPara,function(Index ,ParaItem){
            var argvItem =  GenerateLevelEle(2,ParaItem.Name);
            argvItem.append($('<span class="badge"></span>').text(ParaItem.Val));
            htmlCol.append(argvItem);
          });

          html.append(htmlCol);
        });

        $detail.html(html);

      });
    }
    else if(OperationType === "TestCaseGrp"){
      $el.on("expand-row.bs.table",function(e,index, row, $detail){
        var html = $('<div/>'),
          TestCaseGrpList = OperationList[row.ID].TestCaseList;
        if(OperationList[row.ID] === undefined){
          console.log("No Such ID Resource");
          return;
        }

        $.each(TestCaseGrpList,function(Index,TestCase){
          var htmlCol = $("<div class='col-md-4'></div>"),
              level1Item = GenerateLevelEle(1,(Index+1)+"."+TestCase.Name);
          htmlCol.append(level1Item);
          $.each(TestCase.AtomOperationList,function(Index ,Atom){
            var level2Item = GenerateLevelEle(2,Atom.Name);
            htmlCol.append(level2Item);
            $.each(Atom.CfgPara,function(Index ,ParaItem){
              var level3Item =  GenerateLevelEle(3,ParaItem.Name);
              level3Item.append($('<span class="badge"></span>').text(ParaItem.Val));
              htmlCol.append(level3Item);
            });
          });

          html.append(htmlCol);
        });
        $detail.html(html);

      });
    }
    //显示分级，当前分级：TestCase > Atom > AtomPara
    function GenerateLevelEle(level,val){
      var $el = null;

      switch (level){
        case 1:
          $el = $('<a href="#" class="list-group-item active"></a>');
          break;
        case 2:
          $el = $('<a href="#" class="list-group-item"></a>');
          break;
        case 3:
          $el = $('<a href="#" class="list-group-item Level3"></a>');
          break;
        default:
          break;
      }

      return $el.text(val);

    }




    }







  window.actionEvents = {
    'click .update': function (e, value, row) {
      var ModuleActiveID = $("#TestCaseManageTabHomepage > li.active").attr("id");

      RegisterClickEvent(ModuleActiveID+"_"+row.ID);
    },
    'click .remove': function (e, value, row, index){
      var ModuleActive = $("#TestCaseManageTabHomepage > li.active"),
          ModuleActiveID = ModuleActive.attr("id"),
          $table = $("#"+ModuleActiveID+"Table");

      if (confirm('确定删除:'+row.Name)) {
        Usr.Delete(function(){
          $table.bootstrapTable("removeByUniqueId",row.ID);
        },ModuleActiveID,row.RemoteID);


      }
    }
  };
});