var util = require('util');

var moduler = undefined;

function slave(req, res)
{
    var result = {"result" : ERROR, message : "not found resource"};

    var resource = req.body;

    moduler.updateSlave(resource, function (err, obj){
        if (err || !obj)
        {
            logger.info('not found resource. ', err);
            res.json(result);
        }
        else 
        {
            logger.debug("master recv slave(%d) message", obj.major_id);
            result.result = SUCCESS;
            result.message = 'Success';
            result.slave_id = obj.major_id;
            result.config = obj;
            res.json(result);
        }
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/slave/register', method : 'POST', process : slave},
        {url : '/slave/update', method : 'POST', process : slave}
    ];
};