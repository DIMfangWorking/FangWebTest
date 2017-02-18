var moduler = undefined;

function EIConfig(req,res)
{
    var result = {result : SUCCESS, message : 'success' };
    logger.info("EI Config");

    moduler.EIConfigSerialize(req.body, function (err, data){
        if (err)
        {
            result.result = ERROR;
            result.message = err; //'crate task fail!';
            logger.error("create task error. ", err);
        }

        res.json(result);
    });
}

module.exports = function (mod) {
    moduler = mod;

    return [ 
        {url : '/slave/ei/config/', method : 'POST', process : EIConfig},
    ];
};