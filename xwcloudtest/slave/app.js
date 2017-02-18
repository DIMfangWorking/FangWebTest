var os = require('os');

var common = require('./common/app.js');

function getCpuRate()
{
    var total = 0;
    var idle = 0;
    os.cpus().forEach(function (item){
      total += (item.times.user + item.times.nice + item.times.sys + item.times.idle + item.times.irq);
      idle += (item.times.idle);
    });

    return ((total - idle)/total * 100).toFixed(1);
}

function getMemUsage()
{
  var free = os.freemem();
  var total = os.totalmem();
  return  ((total - free)/total  * 100).toFixed(1);
}

function getSlaveTypeString()
{
  if (! getSlaveTypeString.type)
  {
    var type = getPlatformLib();
    if (type == 'sim')
    {
      type = 'simulation';
    }
    getSlaveTypeString.type = type;
  }

  return getSlaveTypeString.type;
}

function getRegisterData()
{
  var postJson = {"type": getSlaveTypeString(),
                  "cpu" : getCpuRate(), 
                  "mem" : getMemUsage(),
                  "uptime" : process.uptime().toFixed(1), 
                  "hostname" : os.hostname(), 
                  "platfrom" : os.platform(), 
                  "ip" : config.slave.ip,
                  "port" : config.slave.port};

  postJson.device = SlaveManager.getInformation();

  return JSON.stringify(postJson);
}

function getUpdateData()
{
  var postJson = {"type": getSlaveTypeString(),
                  "cpu" : getCpuRate(), 
                  "mem" : getMemUsage(),
                  "uptime" : process.uptime().toFixed(1), 
                  "hostname" : os.hostname(), 
                  "platfrom" : os.platform(), 
                  "ip" : config.slave.ip,
                  "port" : config.slave.port};

  postJson.device = SlaveManager.getInformation();

  return JSON.stringify(postJson);
}

function init(app,express)
{
    var stateMachinePara = {ip : config.master.ip
        , port : config.master.port
        , getUpdateData : getUpdateData
        , getRegData : getRegisterData
        , key : 'slave_id'
        , regPath : '/slave/register'
        , updatePath : '/slave/update'
    };

    if (global.part == 'slave')
    {
        app.use(function(req, res, next) {
            if (req.is('json') == false)
            {
                logger.error("url : " + req.originalUrl +" content-type : " + req.get('Content-Type') + " isJson : " + req.is('json'));
                res.json({result:ERROR, message:"only support json"});
            }
            else
            {
                next();
            }
          }
        );

        SlaveManager.changeToIdle();
    }

    startStatusMachine(stateMachinePara, function (data){
        global.config.database = data;
    });
}

module.exports = init;