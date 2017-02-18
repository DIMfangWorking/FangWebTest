/**
 * Created by Administrator on 2015/9/14.
 */

//TODO:填写导入模块名称
define(function(require){
  //私有成员

  var AtomGrpObj = require("obj/AtomGrpObj"),
      TestCaseGrpObj = require("obj/TestCaseGrpObj"),
      AtomObj = require("obj/AtomObj"),
      SimResObj = require("obj/SimResourceObj"),
      RealResObj = require("obj/RealResourceObj"),
      Name = $.cookie('username'),
      SessionId = $.cookie('xwsessionid'),
      ResListTotal = {
        SimResList:[],
        RealResList:[],
        CIResList:[]
      },
      CurResIDTotal = {
        SimResID:1,
        RealResID:1,
        CIResID:1
      },

      AtomOperationList = [],
      CurAtomOperationId = 1,
      CurComponentId = 1,
      ComponentList = [],
      TestCaseList = [],
      CurTestCaseId = 1,
      TestCaseGrpList = [],
      CurTestCaseGrpId = 1,
      LastClickResID = null,

      //私有方法
      GetUsrName = function() {
        if(Name ==null){
          console.log("No UserName!");
          return;
        }
        return Name;
      },
      GetSessionId = function() {
        if(SessionId ==null){
          console.log("No SessionId!");
          return;
        }
        return SessionId;
      },
      GetSimResId = function() {
        if(CurResIDTotal.SimResID ==null){
          console.log("No CurSimResId!");
          return;
        }

        return CurResIDTotal.SimResID;
      },
      SetSimResId = function(ID) {
        CurResIDTotal.SimResID = ID;
      },
      GetRealResId = function() {
        if(CurResIDTotal.RealResID ==null){
          console.log("No CurRealResId!");
          return;
        }

        return CurResIDTotal.RealResID;
      },
      SetRealResId = function(ID) {
        CurResIDTotal.RealResID = ID;
      },
      GetCIResId = function() {
      if(CurResIDTotal.CIResID ==null){
        console.log("No CurRealResId!");
        return;
      }

      return CurResIDTotal.CIResID;
    },
      SetCIResId = function(ID) {
      CurResIDTotal.CIResID = ID;
    },
      GetTestGrpId = function() {
        if(CurTestCaseGrpId ==null){
          console.log("No CurTestCaseGrpId!");
          return;
        }
        return CurTestCaseGrpId;
    },
      SetTestGrpId = function(ID) {
        CurTestCaseGrpId = ID;
    },
      GetTestCaseId = function() {
        if(CurTestCaseId ==null){
          console.log("No CurTestCaseId!");
          return;
        }
        return CurTestCaseId;
    },
      SetTestCaseId = function(ID) {
        CurTestCaseId = ID;
    },
      GetAtomId = function() {
        if(CurAtomOperationId ==null){
          console.log("No CurAtomOperationId!");
          return;
        }
        return CurAtomOperationId;
    },
      SetAtomId = function(ID) {
        CurAtomOperationId = ID;
    },
      GetComponentId = function() {
        if(CurComponentId ==null){
          console.log("No CurComponentId!");
          return;
        }
        return CurComponentId;
      },
      SetComponentId = function(ID) {
        CurComponentId = ID;
      },

      AddOneMajorRes = function(MajorResItem,ResType){
        var ResList = null,
            ResId = 0,
            SetResHandler = null,
            SubResIndx = 0,
            MinorRes = null,
            ResObj = null,
            ResInst = null,
            ParaList = null,
            SubResList = MajorResItem.sub_resource;

        if(ResType==="CI"){
          ResList = ResListTotal.CIResList;
          ResId = GetCIResId();
          SetResHandler = SetCIResId;
        }
        else if(ResType === 'Sim'){
          ResList = ResListTotal.SimResList;
          ResId = GetSimResId();
          SetResHandler = SetSimResId;

        }
        else if(ResType === "Real"){
          ResList = ResListTotal.RealResList;
          ResId = GetRealResId();
          SetResHandler = SetRealResId;
        }

        //遍历从设备
        if(MajorResItem.type === 'simulation'){
          if(SubResList ==null){
            if(MajorResItem.status !== "lost"){
              console.log("SubResList is null,Status is not lost");
            }
            ParaList = $.extend(true,{},{ID:ResId},MajorResItem);
            ResList[ResId] = new SimResObj(ParaList);
            SetResHandler(++ResId);
            return;
          }
          for(SubResIndx in SubResList){
            if(SubResList.hasOwnProperty(SubResIndx)) {
              MinorRes = SubResList[SubResIndx];
            }
            else{
              console.log("SubResList does not hasOwnProperty SubResIndx,SubResIndx = "+SubResIndx);
              continue;
            }
            //记录到对应实例中
            ParaList = $.extend({},{ID:ResId,major_id:MajorResItem.major_id},MinorRes);
            ResList[ResId] = new SimResObj(ParaList);
            SetResHandler(++ResId);
          }
        }
        else if(MajorResItem.type === "real"){
          ParaList = $.extend({},{ID:ResId},MajorResItem);
          ResInst = new RealResObj(ParaList);
          if(SubResList !==null &&SubResList.length !==0){
            ResInst.AddMinorResList(SubResList);
          }
          else if(MajorResItem.status !== "lost"){
            console.log("SubResList is null,Status is not lost");
          }
          ResList[ResId] = ResInst;
          SetResHandler(++ResId);
        }
        else{
          console.log("Unknown Resource Type = "+MajorResItem.type);
          return;
        }

      },
      AddOneTestCaseGrp = function(TestCaseGrpItem){
        var CurTestGrpId = GetTestGrpId();
        var TestCaseGrp = null;
        TestCaseGrp = new TestCaseGrpObj($.extend({},{ID:CurTestGrpId},TestCaseGrpItem));
        TestCaseGrpList[CurTestGrpId] = TestCaseGrp;
        SetTestGrpId(++CurTestGrpId);
        return TestCaseGrp;
      },
      AddOneTestCase = function(TestCaseItem){
        var CurTestCaseId = GetTestCaseId();
        var TestCaseInst = null;
        TestCaseInst = new AtomGrpObj($.extend({},{ID:CurTestCaseId,Type:"TestCase"},TestCaseItem));

        TestCaseList[CurTestCaseId] = TestCaseInst;
        SetTestCaseId(++CurTestCaseId);
        return TestCaseInst;
    },
      AddOneAtom = function(AtomOperationItem){
        var CurAtomId = GetAtomId();
        var AtomInst = null;
        AtomInst = new AtomObj($.extend({},{ID:CurAtomId},AtomOperationItem));
        AtomOperationList[CurAtomId] = AtomInst;
        SetAtomId(++CurAtomId);
        return AtomInst;
    },
      AddOneComponent = function(ComponentItem){
        var CurComponentId = GetComponentId();
        var ComponentInst = null;
        ComponentInst = new AtomGrpObj($.extend({},{ID:CurComponentId,Type:"Component"},ComponentItem));
        ComponentList[CurComponentId] = ComponentInst;
        SetComponentId(++CurComponentId);
        return ComponentInst;
      },
      AddAtomToAtomGrp = function (AtomGrp,AtomToAdd) {
        var AtomItem = null;
        if(AtomToAdd ==null || AtomToAdd.length ===0){
          console.log("AtomToAddisnull");
          return;
        }
        AtomItem = new AtomObj($.extend({},{ID:AtomToAdd.id},AtomToAdd));
        AddParaToAtom(AtomItem,AtomToAdd.argv);
        AtomGrp.AddAtom(AtomItem);
      },
      AddParaToAtom = function (Atom,ParaList) {
        var argItem = null;
        if(ParaList==null || ParaList.length===0){
          console.log("AtomId:"+Atom.id+"ParaList len=0");
          return;
        }
        for(argItem in ParaList){
          if(ParaList.hasOwnProperty(argItem)){
            Atom.AddPara(ParaList[argItem].name,ParaList[argItem].value,ParaList[argItem].comment,ParaList[argItem].type);
          }
        }
      },
      AddResToList = function(ResListArray,ResType) {
        var MajorRes = null,
            SubResList = null;

        //遍历主设备资源列表
        for(var ResIndx in ResListArray){
          if(ResListArray.hasOwnProperty(ResIndx)){
            MajorRes = ResListArray[ResIndx];
          }
          else{
            console.log("ResListArray does not hasOwnProperty ResIndx,ResIndx = "+ResIndx);
            continue;
          }
          SubResList = MajorRes.sub_resource;

          AddOneMajorRes(MajorRes,ResType);
        }
  },

      //公有方法
      GetLastClickResID = function(){
        if(LastClickResID !=null){
          return LastClickResID;
        }
        else{
          console.log("No LastClickResID");
        }
      },
      SetLastClickResID = function(ID){
        LastClickResID = ID;
      },
      GetSimResList = function(){

        if(ResListTotal.SimResList.length ===0){
          console.log("SimResList is empty");
          return;
        }
          return ResListTotal.SimResList;
    },
      GetRealResList = function(){

        if(ResListTotal.RealResList.length ===0){
          console.log("RealResList is empty");
          return;
        }
        return ResListTotal.RealResList;
      },
      GetCIResList = function(){

      if(ResListTotal.CIResList.length ===0){
        console.log("RealResList is empty");
        return;
      }
      return ResListTotal.CIResList;
    },
      GetAtomOperationList = function(){
        if(AtomOperationList==null || AtomOperationList.length ===0){
          console.log("AtomOperationList is empty");
          return null;
        }
        return AtomOperationList;
    },
      GetComponentList = function(){
        if(ComponentList==null || ComponentList.length ===0){
          console.log("ComponentList is empty");
          return null;
        }
        return ComponentList;
      },
      GetTestCaseList = function(){
        if(TestCaseList==null || TestCaseList.length ===0){
          console.log("TestCaseList is empty");
          return null;
        }
        return TestCaseList;
    },
      GetTestCaseGrpList = function(){
        if(TestCaseGrpList==null || TestCaseGrpList.length ===0){
          console.log("TestCaseGrpList is empty");
          return null;
        }
        return TestCaseGrpList;
    },


      QueryResList = function(callback,type){

        var urlpara = "/front/resource?";

        switch (type){
          case "Sim":
            urlpara += "type=simulation&resource_type=manual";
            break;
          case "Real":
            urlpara += "type=real&resource_type=manual";
            break;
          case "CI":
            urlpara += "all=1&resource_type=auto";
            break;
          default :
            urlpara += "all=1&resource_type=";
            break;
        }
        $.ajax({
          type:"GET",
          url:urlpara,
          cache:false,
          dataType:'json',
          contentType:"application/json;charset=UTF-8",
          context:this,
          success:function(ResListArray) {
            var Restype = type;
            if(ResListArray.result == -1){
              console.log(ResListArray.message);
              return;
            }
            if(ResListArray.length === 0){
              console.log("ResList Empty");
              return;
            }

            RemoveAllRes(Restype);
            //加入ResList
            AddResToList(ResListArray,Restype);
            callback(Restype);
          },
          error: function() {
            console.log(type+"ResList Fetch Error!");
          }
        });
      },
      RemoveAllRes = function (Type){
        var ResItem = null,
            ResList = null,
            ResSetHandler = null;

        if(Type === "Sim"){
          ResList = ResListTotal.SimResList;
          ResSetHandler = SetSimResId;
        }
        else if(Type === "Real"){
          ResList = ResListTotal.RealResList;
          ResSetHandler = SetRealResId;
        }
        else if(Type === "CI"){
          ResList = ResListTotal.CIResList;
          ResSetHandler = SetCIResId;
        }
        if(ResList.length ===0){
          console.log("No"+Type+"Resource to Remove");
          return;
        }

        ResList = [];
        ResSetHandler(1);


      },
      GenerateTestCaseGrpList = function(TestGrpObj){
        var Instance = null,
            TestCaseGrpItem = null,
            item = null,
            TestCaseItem = null,
            TestCaseInst = null,
            TestCaseIndx = 1,
            OriTestCaseInst = null,
            testcase_item = null;

        if(TestGrpObj.testgroup.length === 0){
          console.log('testgroup is empty');
          return [];
        }

        if(TestCaseGrpList.length !=0){
          TestCaseGrpList = [];
        }

        //向Usr中添加用例组
        for(item in TestGrpObj.testgroup){
          if(TestGrpObj.testgroup.hasOwnProperty(item)){
            TestCaseGrpItem = TestGrpObj.testgroup[item];
          }
          else{
            console.log("TestGroup hasNoOwnProperty of "+item);
            continue;
          }
          Instance = AddOneTestCaseGrp(TestCaseGrpItem);

          if(TestCaseGrpItem.testcase.length ===0){
            console.log('TestCaseGrp_'+item+'\'s testcase is empty');
            continue;
          }

          for(testcase_item in TestCaseGrpItem.testcase){
            if(TestCaseGrpItem.testcase.hasOwnProperty(testcase_item)){
              TestCaseItem = TestCaseGrpItem.testcase[testcase_item];
              TestCaseInst = new AtomGrpObj($.extend({},{ID:TestCaseIndx,Type:"TestCase"},TestCaseItem));
              Instance.AddTestCase(TestCaseInst);
              ++TestCaseIndx;
              OriTestCaseInst = SearchTestCase(TestCaseInst.Name,TestCaseInst.ServerId);
              if(OriTestCaseInst != null){
                TestCaseInst.AtomOperationList = $.extend(true,{},OriTestCaseInst.AtomOperationList);
              }

            }

          }

        }

        return GetTestCaseGrpList();

  },
      GenerateTestCaseList = function(TestCaseList){
        var TestCaseInst = null,
            TestCaseItem = null,
            TestCase = null,
            AtomInst = null,
            AtomItem = null,
            AtomGrp = null;

        if(TestCaseList.testcase.length ===0){
          console.log('testcase is empty');
          return [];
        }

        for(TestCaseItem in TestCaseList.testcase){
          if(TestCaseList.testcase.hasOwnProperty(TestCaseItem)){
            TestCase = TestCaseList.testcase[TestCaseItem];
            TestCaseInst = AddOneTestCase(TestCase);
          }
          else{
            console.log("TestCaseList.testcase has no ownProperty = "+TestCaseItem);
            continue;
          }
          //TODO:重构
          AtomGrp = TestCase.sequenceOfOpera;
          for(AtomItem in AtomGrp){
            if(AtomGrp.hasOwnProperty(AtomItem)){
              AddAtomToAtomGrp(TestCaseInst,AtomGrp[AtomItem]);
            }
          }
        }

        return GetTestCaseList();

  },
      GenerateAtomList = function(AtomicOperationList){
        var AtomItem = null,
            AtomOperation = null,
            argItem = null,
            AtomOperationItem = null;

        if(AtomicOperationList.keyword.length ===0){
          console.log('testcase is empty');
          return [];
        }

        for(AtomItem in AtomicOperationList.keyword){
          if(AtomicOperationList.keyword.hasOwnProperty(AtomItem)){
            AtomOperationItem = AtomicOperationList.keyword[AtomItem];
            AtomOperation = AddOneAtom(AtomOperationItem);
          }
          else{
            console.log("AtomicOperationList.keyword does not have ownproperty of "+AtomItem);
            continue;
          }

          //向AtomOperation增加参数
          if(AtomOperationItem.argv.length ===0){
            console.log("Atom:"+AtomOperationItem.name+"has no para");
            continue;
          }
          AddParaToAtom(AtomOperation,AtomOperationItem.argv);
        }
        return GetAtomOperationList();
  },
      GenerateComponentList = function(ComponentList){

        var ComponentItem = null,
            Component = null,
            AtomItem = null,
            Atom = null,
            argItem = null,
            AtomGrp = null,
            ComponentInst = null;

        if(ComponentList.component.length ===0 || ComponentList.component == null){
          console.log('Response component is empty');
          return [];
        }

        for(ComponentItem in ComponentList.component){
          if(ComponentList.component.hasOwnProperty(ComponentItem)){
            Component = ComponentList.component[ComponentItem];
            ComponentInst = AddOneComponent(Component);
          }
          else{
            console.log("ComponentList.component has no own property "+ComponentItem);
            continue;
          }
          //TODO:重构
          AtomGrp = Component.sequenceOfOpera;
          if(AtomGrp.length ===0){
            console.log("ComponentItem id = "+Component.id+"sequenceOfOpera is empty");
            continue;
          }
          for(AtomItem in AtomGrp){
            if(AtomGrp.hasOwnProperty(AtomItem)){
              AddAtomToAtomGrp(ComponentInst,AtomGrp[AtomItem]);
            }
          }
        }

        return GetComponentList();
  },

      Query = function(callback,Type){

        var urlPara = "",
            ResList = null,
            Handler = null;

        switch (Type){
          case "Atom":
            urlPara = '/front/keyword/list?all=1';
            Handler = GenerateAtomList;
            ResList = GetAtomOperationList();
            break;
          case "Component":
            urlPara = '/front/component/list?all=1';
            Handler = GenerateComponentList;
            ResList = GetComponentList();
            break;
          case "TestCase":
            urlPara = '/front/testcase/list?all=1';
            Handler = GenerateTestCaseList;
            ResList = GetTestCaseList();
            break;
          case "TestCaseGrp":
            urlPara = '/front/testgroup/list?all=1';
            Handler = GenerateTestCaseGrpList;
            //TestCaseList为空，查询后再生成TestCaseGrpList
            if(GetTestCaseList() ===null){
              Query(function(Type,ResList){
                if(Type === "TestCase" && ResList.length !==0){
                  Query(callback,"TestCaseGrp");
                }
              },"TestCase");
              return;
            }
            break;
          default :
            console.log("Query unknown Type");
            return;
            break;
        }
        if(ResList !==null){
          callback(Type,ResList);
        }
        else{
          $.ajax({
            type:"GET",
            url:urlPara,
            cache:false,
            dataType:'json',
            contentType:'application/json;charset=UTF-8',
            context:this,
            success:function(Result){
              var OperationList = null;
              if(Result.result !=0 || Result.message != 'success'){
                callback(Result);
                return;
              }
              OperationList = Handler(Result);
              callback(Type,OperationList);
            },
            error: function() {
              console.log("Query ComponentList Error!");
              callback(Type,null);
            }
          });
        }


      },
      Create = function(callback,id,data){
        var urlPara = "";

        switch (id){
          case "ComponentCreate":
            urlPara = '/front/component/';
            break;
          case "TestCaseCreate":
            urlPara = '/front/testcase/';
            break;
          case "TestCaseGrpCreate":
            urlPara = '/front/testgroup/';
            break;
        }
        $.ajax({
          type:"POST",
          url:urlPara,
          cache:false,
          dataType:'json',
          contentType:'application/json;charset=UTF-8',
          context:this,
          data:JSON.stringify(data),
          success:function(Result){

            callback(Result);
          },
          error: function() {
            console.log("Query"+id+"Error!");
          }
        });
      },
      Modify = function (callback,id,data) {
        var urlpara = "";

        switch (id){
          case "Component":
            urlpara = '/front/component/';
            break;
          case "TestCase":
            urlpara = '/front/testcase/';
            break;
          case "TestCaseGrp":
            urlpara = '/front/testgroup/';
            break;
        }

        $.ajax({
          type:"PUT",
          url:urlpara,
          cache:false,
          dataType:'json',
          contentType:'application/json;charset=UTF-8',
          context:this,
          data:JSON.stringify(data),
          success:function(Result){

            callback(Result);

          },
          error: function() {
            console.log("Query"+id+"Error!");
          }
        });

      },
      Delete = function (callback,id,Index) {

        var urlpara = "";

        switch (id){
          case "Component":
            urlpara = '/front/component/' + Index;
            break;
          case "TestCase":
            urlpara = '/front/testcase/' + Index;
            break;
          case "TestCaseGrp":
            urlpara = '/front/testgroup/' + Index;
            break;
        }

        $.ajax({
          type:"DELETE",
          url:urlpara,
          cache:false,
          dataType:'json',
          contentType:'application/json;charset=UTF-8',
          success:function(Result){
            if(Result.result !=0 || Result.message != 'success'){
              return;
            }
            callback();

          },
          error: function() {
            console.log("Delete"+id+"_"+Index+"Error!");
          }
        });

      },
      SearchTestCase = function(name,id){
        if(TestCaseList.length ===0){
          console.log("No TestCase,Empty!");
          return;
        }
        for(var item in TestCaseList){
          if(TestCaseList.hasOwnProperty(item) && TestCaseList[item].Name === name && TestCaseList[item].ServerId === id){
            return TestCaseList[item];
          }
        }

        return null;
  };

      //公有方法
      return{
        Query:Query,
        Create:Create,
        Modify:Modify,
        Delete:Delete,
        SearchTestCase:SearchTestCase,
        QueryResList:QueryResList,
        RemoveAllRes:RemoveAllRes,
        GetUsrName:GetUsrName,
        GetSessionId:GetSessionId,
        GetLastClickResID:GetLastClickResID,
        SetLastClickResID:SetLastClickResID,
        GetSimResList:GetSimResList,
        GetRealResList:GetRealResList,
        GetCIResList:GetCIResList,
        GetAtomOperationList:GetAtomOperationList,
        GetComponentList:GetComponentList,
        GetTestCaseList:GetTestCaseList,
        GetTestCaseGrpList:GetTestCaseGrpList
      }
});
