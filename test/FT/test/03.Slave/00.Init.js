var assert = require('assert');

describe('Slave', function(){
  before(function(){
    console.log('00.init start')
    process.argv = ['npm', 'start', 'slave'];
  });

  after(function(){
    console.log('00.init end')
    //process.exit(0);
  });

  // it('process config', function(done){
  //   assert.eq(process.argv[process.argv.length - 1], 'web', "process argv error");
  //   done();
  // });
});