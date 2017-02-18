var assert = require('assert');
var should = require('chai').should();

describe('Master', function(){
  describe('Sim Task', function(){
    describe('Create para error CI task', function(){
      var send_http_request = undefined;

      it('should return true when create sim task successfully', function(done){
        send_http_request = sendHttpRequest;
        global.sendHttpRequest = function (options, postData, callback){
          assert.equal(options.hostname, '172.31.3.155', 'master ip error');
          assert.equal(options.port, 3000, 'master port error');
          assert.equal(options.method, 'POST', 'master method error');
          assert.equal(options.path, '/master/CI/task', 'master path error');

          JSON.parse(postData);

          callback(null, null, JSON.stringify({task_id : 1, result : SUCCESS, message : ""}));

          global.sendHttpRequest = send_http_request;
        }

        var task_view = require_module('master/view/task')();

        MasterStore = {
          'ip': '172.31.3.155',
          'port': 3000,
          'status': 'normal'};

        var request = {
          body : {
            'type': 'simulation',
            'env_type': 'LTE',
            'revision': '12324',
            'code_path': null,
            //'http://svn.xa.com/svn/LTE_CODE/branches/McLTE_v3.0.7.5_Patch/codebts'
          }
        };

        var response = {
          json : function(result){
            assert.equal(!!result, true, 'Create Sim Task Fail !');
            assert.equal(result.result, SUCCESS, 'Create Sim Task Fail !');
            done();
          }
        };

        for(var item in task_view)
        {
          if (task_view[item].url == '/front/CI/task')
            break;
        }

        assert.equal(task_view[item].url, '/front/CI/task', 'not found ci task url');

        task_view[item].process(request, response);
      });
    })
  });
});