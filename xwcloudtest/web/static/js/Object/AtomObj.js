/**
 * Created by Administrator on 2015/9/17.
 */

//原子操作类
define(function(){
  var AtomObj = function(ParaList){
    this.ID = ParaList.ID;
    this.Name = ParaList.name;
    this.Creator = ParaList.user;
    this.Descp = ParaList.desc;
    this.ServerId = ParaList.id;
    this.Type = ParaList.type;
    this.Env = ParaList.env;
    this.CfgPara = [];
    this.validate = {
      rules: {},
      messages: {}
    }
  };
  AtomObj.prototype = {

    GetID: function() {
      return this.ID;
    },

    GetDescription: function () {
      return this.Descp;
    },

    AddPara: function(name,val,comment,type) {

      //防止重复添加属性
      this.RemovePara(name);
      this.CfgPara.push({
        Name:name,
        Val:val,
        Comment:comment,
        Type:type       //标示字段是否必填
      });
      //加入对应的校验规则
      this.validate.rules[name] = {required: true};
      this.validate.messages[name] = {required: "请输入"};
    },

    RemovePara:function(Name){

      if(this.CfgPara.length === 0){
        console.log('CfgPara Empty Can\'t Delete');
        return;
      }

      for(var Index in this.CfgPara){
        if(this.CfgPara.hasOwnProperty(Index) && this.CfgPara[Index].Name === Name) {
          break;
        }
      }

      if(Index === (this.CfgPara.length - 1).toString()){
        console.log('No Such TestCaseName='+Name);
        return -1;
      }

      this.CfgPara.splice(Index,1);
    }
  };
  return AtomObj;
});
