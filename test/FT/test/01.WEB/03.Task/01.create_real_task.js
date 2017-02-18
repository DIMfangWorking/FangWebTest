var assert = require('assert');

describe('WEB', function(){
  describe('Real Task', function(){
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

        var task_view = require_module('web/view/task')();

        MasterStore = {
          'ip': '172.31.3.155',
          'port': 3000,
          'status': 'normal'};

        var request = {
          body : {
            'type': 'real',
            'env_type': 'LTE',
            'bin_file': "ftp://version.xa.com/McLTE_V3.1.7.0T1989/software/McLTE.3.1.7.0T1989.BIN",
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