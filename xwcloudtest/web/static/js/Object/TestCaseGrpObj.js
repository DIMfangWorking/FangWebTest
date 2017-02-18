/**
 * Created by Administrator on 2015/9/17.
 */

//TestCase,TestCaseGrp，查询获得的AtomList都是Atom的集合
define(function(require){
  var TestCaseGrpObj = function(ParaList){

    this.ID = ParaList.ID;
    this.Name = ParaList.name;
    this.TestCaseList = [];
    this.Creator = ParaList.user;
    this.Type = ParaList.type;
    this.Desc = ParaList.desc;
    this.ServerId = ParaList.id;
  };

  TestCaseGrpObj.prototype = {

    GetID: function() {
      return this.ID;
    },

    GetTestCaseList:function(){
      return this.TestCaseList;
    },

    AddTestCase: function (TestCase){
      //this.RemoveTestCase(TestCase.Name);
      this.TestCaseList.push(TestCase);
    },

    RemoveTestCase:function(Name){

      if(this.TestCaseList.length ===0){
        console.log('TestCaseGrpList Empty');
        return;
      }

      for(var Index in this.TestCaseList){

        if(this.TestCaseList.hasOwnProperty(Index) && this.TestCaseList[Index].Name === Name){
          break;
        }
      }

      if(Index === (this.TestCaseList.length - 1).toString()){
        console.log('No such TestCase Name='+Name);
        return -1;
      }

      this.TestCaseList.splice(Index,1);
    }
  };

  return TestCaseGrpObj;
});



