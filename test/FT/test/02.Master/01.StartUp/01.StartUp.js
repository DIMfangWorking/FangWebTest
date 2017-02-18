var should = require('chai').should();

describe('Master', function(){
  describe('Start Up', function(){
    it('config nomorl', function(done){
      var import_app = 1;
      require_module('app');
      import_app.should.equal(1);
      done();
    });
  });
});