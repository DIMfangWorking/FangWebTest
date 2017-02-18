var assert = require('assert');

describe('WEB', function(){
  describe('User', function(){
    describe('Login', function(){
      it('should return 1 when the user login successfully', function(done){
        var user_view = require_module('web/view/user')();

        for(var item in user_view)
        {
          if (user_view[item].url == '/front/user/login')
            break;
        }

        assert.equal(user_view[item].url, '/front/user/login', 'not found user login url');

        var req = { body : { name : 'liujinxing', password : 'xw123...' }, session : { } };
        var res = {
          json : function (result){
            assert.equal(result.result, SUCCESS, "loging not success");
            done();
          }
        };
        user_view[item].process(req, res);
      });
    });
  });
});