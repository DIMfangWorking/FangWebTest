var assert = require('assert');

describe('WEB', function(){
  describe('Start Up', function(){
    it('config nomorl', function(done){
      require_module('app');
      assert.equal(1, 1, 'not start up');
      done();
    });
  });
});