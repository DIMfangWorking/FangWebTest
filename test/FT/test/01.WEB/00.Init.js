var assert = require('assert');

describe('WEB', function(){
  before(function(){
    console.log('00.init start');
    process.argv = ['npm', 'start', 'web'];
  });

  after(function(){
    console.log('00.init end');
    //process.exit(0);
  });

  it('process config', function(done){
    assert.equal(process.argv[process.argv.length - 1], 'web', "process argv error");
    done();
  });
});