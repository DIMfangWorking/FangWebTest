var should = require('chai').should();

describe('Master', function(){
  before(function(){
    console.log('00.init start')
    process.argv = ['npm', 'start', 'master'];
  });

  after(function(){
    console.log('00.init end')
    //process.exit(0);
  });

  it('process config', function(done){
    process.argv[process.argv.length - 1].should.equal('master');
    done();
  });
});