/**
 * Created by Administrator on 2015/9/17.
 */

//TestCase,TestCaseGrp，查询获得的AtomList都是Atom的集合
define(function(){
  var AtomGrpObj = function(ParaList){

    this.ID = ParaList.ID;
    this.Name = ParaList.name;
    this.AtomOperationList = [];
    this.Creator = ParaList.user;
    this.Desc = ParaList.desc;
    this.ServerId = ParaList.id;
    this.Category = ParaList.type;
    this.Type = ParaList.Type;
  };

  AtomGrpObj.prototype = {

    GetID: function() {
      return this.ID;
    },

    GetAtomList:function(){
      return this.AtomOperationList;
    },

    AddAtom: function (Atom){

      this.AtomOperationList.push(Atom);
    },

    RemoveAtom:function(Name){

      if(this.AtomOperationList.length ===0){
        console.log('AtomOperationList Empty');
        return;
      }

      for(var Index in this.AtomOperationList){

        if(this.AtomOperationList.hasOwnProperty(Index) && this.AtomOperationList[Index].Name === Name){
          break;
        }
      }

      if(Index === (this.AtomOperationList.length - 1).toString()){
        console.log('No such AtomOperation Name='+Name);
        return -1;
      }

      this.AtomOperationList.splice(Index,1);
    }
  };

  return AtomGrpObj;
});


