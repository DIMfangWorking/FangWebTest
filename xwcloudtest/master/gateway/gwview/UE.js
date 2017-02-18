var util = require('util');

var moduler = undefined;

function online(req, res)
{
    var result = {"result" : ERROR, message : "not found resource"};

    var ue = req.body;

    moduler.UEOnline(ue, function (err){
        if (err)
        {
            logger.info('ue online fail. ', err);
            res.json(result);
        }
        else 
        {
            result.result = SUCCESS;
            result.message = 'Success';
            res.json(result);
        }
    });
}

function offline(req, res)
{
    var result = {"result" : ERROR, message : "not found resource"};

    var ue = req.body;

    moduler.UEOffline(ue, function (err, obj){
        if (err)
        {
            logger.info('not found ue. ', err);
            res.json(result);
        }
        else 
        {
            result.result = SUCCESS;
            result.message = 'Success';
            res.json(result);
        }
    });
}

function bandwitdth(req, res)
{
    var result = {"result" : ERROR, message : "not found resource"};

    var ue = req.body;

    moduler.UEBandwitdth(ue, function (err, obj){
        if (err)
        {
            logger.info('not found ue. ', err);
            res.json(result);
        }
        else 
        {
            result.result = SUCCESS;
            result.message = 'Success';
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/UE/Online', method : 'POST', process : online},
        {url : '/UE/Offline', method : 'POST', process : offline},
        {url : '/UE/BandWitdth', method : 'POST', process : bandwitdth}
    ];
};