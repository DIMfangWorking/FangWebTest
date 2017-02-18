var os = require('os');
var http = require('http');
var common = require('./common/app.js');
var MQUtil = require('./common/MQUtil.js');
function getData()
{
    var postData = JSON.stringify({"master_id" : global.state.id,
                                   "cpu" : os.cpus()[0].model, 
                                   "mem" : os.freemem() / os.totalmem(), 
                                   "uptime" : os.uptime(), 
                                   "hostname" : os.hostname(), 
                                   "platfrom" : os.platform(), 
                                   "ip" : config.master.ip,
                                   "port" : config.master.port});

    return postData;
}

function init(app,express)
{
    var stateMachinePara = {ip : config.web_server.ip
        , port : config.web_server.port
        , getUpdateData : getData
        , getRegData : getData
        , key : 'master_id'
        , regPath : '/master/register'
        , updatePath : '/master/update'
    };

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
    startStatusMachine(stateMachinePara, function (data) {
    });

    global.MQUtil = MQUtil;
}

module.exports = init;