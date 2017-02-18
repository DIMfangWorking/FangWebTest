function SlaveManager()
{
  var status = STATUS_LOST;

  this.desc = 'not implemented';

  this.changeToIdle = function ()
  {
    status = RESOURCE_STATUS_IDLE;
  };

  this.getInformation = function()
  {
    return null;
  }
}

global.SlaveManager = new SlaveManager();

module.exports = {
    SlaveManager : SlaveManager
}